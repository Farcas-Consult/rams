import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";

import { db, schema } from "@/db";
import { upsertCredentialAccount } from "@/lib/server/user-admin";

const acceptInviteSchema = z.object({
  token: z.string().uuid("Invalid invite token"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(255).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, name } = acceptInviteSchema.parse(body);

    const [user] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.invitationToken, token))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      );
    }

    if (user.status !== "invited") {
      return NextResponse.json(
        { message: "Invitation already used" },
        { status: 409 }
      );
    }

    if (
      user.invitationExpiresAt &&
      user.invitationExpiresAt.getTime() < Date.now()
    ) {
      return NextResponse.json(
        { message: "Invitation has expired" },
        { status: 410 }
      );
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(schema.user)
        .set({
          name: name ?? user.name ?? user.email,
          status: "active",
          emailVerified: true,
          invitedAt: null,
          invitationToken: null,
          invitationExpiresAt: null,
          updatedAt: now,
        })
        .where(eq(schema.user.id, user.id));

      await upsertCredentialAccount(tx, user.id, passwordHash);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", issues: error.issues },
        { status: 422 }
      );
    }
    console.error("[users] Accept invite failed", error);
    return NextResponse.json(
      { message: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}

