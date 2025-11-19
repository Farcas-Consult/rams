import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db, schema } from "@/db";
import {
  updateUserSchema,
  userResponseSchema,
} from "@/app/(dashboard)/dashboard/users/schemas/user-schemas";
import {
  handleApiError,
  BadRequestError,
  NotFoundError,
} from "@/lib/server/errors";
import {
  assertPermissionGrant,
  assertRoleGrant,
  requireUserWithPermission,
} from "@/lib/server/authz";
import {
  serializeUser,
  upsertCredentialAccount,
} from "@/lib/server/user-admin";
import type { PermissionKey } from "@/lib/permissions";
import { sendUserInviteEmail } from "@/lib/email";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireUserWithPermission("users:read");
    const { id } = await params;

    const user = await getUserById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return NextResponse.json(userResponseSchema.parse(serializeUser(user)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const actor = await requireUserWithPermission("users:update", request.headers);
    const body = await request.json();
    const payload = updateUserSchema.parse(body);

    const { id: userId } = await params;

    if (payload.id && payload.id !== userId) {
      throw new BadRequestError("Payload ID does not match URL parameter");
    }

    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (payload.email && payload.email !== user.email) {
      const [emailOwner] = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(
          and(
            eq(schema.user.email, payload.email),
            ne(schema.user.id, userId)
          )
        )
        .limit(1);

      if (emailOwner) {
        throw new BadRequestError("Email is already in use by another user");
      }
    }

    const requestedRole = payload.role ?? user.role;
    assertRoleGrant(actor, requestedRole);

    const permissions =
      payload.permissions !== undefined
        ? dedupePermissions(payload.permissions)
        : undefined;

    if (permissions) {
      assertPermissionGrant(actor, permissions);
    }

    const now = new Date();
    const updates: Partial<typeof schema.user.$inferInsert> = {
      updatedAt: now,
    };

    if (payload.email) updates.email = payload.email;
    if (payload.name) updates.name = payload.name;
    if (payload.role) updates.role = payload.role;
    if (payload.status) updates.status = payload.status;
    if (permissions) updates.permissions = permissions;

    if (payload.resendInvite) {
      updates.status = "invited";
      updates.invitedAt = now;
      updates.invitationToken = randomUUID();
      updates.invitationExpiresAt = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000
      );
    }

    let updatedUser = user;

    await db.transaction(async (tx) => {
      await tx
        .update(schema.user)
        .set(updates)
        .where(eq(schema.user.id, userId));

      if (payload.password) {
        const hashed = await hashPassword(payload.password);
        await upsertCredentialAccount(tx, userId, hashed);
      }

      const [freshUser] = await tx
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);

      if (!freshUser) {
        throw new NotFoundError("User not found after update");
      }

      updatedUser = freshUser;
    });

    if (payload.resendInvite && updatedUser.invitationToken) {
      await dispatchInviteEmail({
        email: updatedUser.email,
        token: updatedUser.invitationToken,
        name: updatedUser.name,
        inviterName: actor.name ?? actor.email ?? "RAMS Admin",
      });
    }

    return NextResponse.json(
      userResponseSchema.parse(serializeUser(updatedUser))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const actor = await requireUserWithPermission("users:delete");
    const { id } = await params;

    if (actor.id === id) {
      throw new BadRequestError("You cannot delete your own account");
    }

    const deleted = await db
      .delete(schema.user)
      .where(eq(schema.user.id, id))
      .returning({ id: schema.user.id });

    if (deleted.length === 0) {
      throw new NotFoundError("User not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

async function getUserById(id: string) {
  const [record] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, id))
    .limit(1);

  return record ?? null;
}

function dedupePermissions(permissions: PermissionKey[]) {
  return Array.from(new Set(permissions));
}

async function dispatchInviteEmail({
  email,
  token,
  name,
  inviterName,
}: {
  email: string;
  token: string;
  name?: string | null;
  inviterName: string;
}) {
  try {
    await sendUserInviteEmail({
      to: email,
      token,
      name,
      inviter: inviterName,
    });
  } catch (error) {
    console.error(
      `[users] Failed to dispatch invite email for ${email}`,
      error
    );
  }
}


