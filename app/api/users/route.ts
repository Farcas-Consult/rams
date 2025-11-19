import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  or,
  sql,
} from "drizzle-orm";

import { db, schema } from "@/db";
import {
  createUserSchema,
  paginatedUserResponseSchema,
  userQuerySchema,
  userResponseSchema,
  type UserQuery,
} from "@/app/(dashboard)/dashboard/users/schemas/user-schemas";
import {
  handleApiError,
  BadRequestError,
} from "@/lib/server/errors";
import {
  assertPermissionGrant,
  assertRoleGrant,
  requireUserWithPermission,
  sanitizePermissions,
} from "@/lib/server/authz";
import {
  generateUniqueUsername,
  serializeUser,
} from "@/lib/server/user-admin";
import type {
  PermissionKey,
  UserStatus,
} from "@/lib/permissions";
import { sendUserInviteEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    await requireUserWithPermission("users:read", request.headers);

    const url = new URL(request.url);
    const query = userQuerySchema.parse({
      page: parseNumber(url.searchParams.get("page")),
      pageSize: parseNumber(url.searchParams.get("pageSize")),
      search: url.searchParams.get("search") ?? undefined,
      emailVerified: parseBoolean(url.searchParams.get("emailVerified")),
      status: url.searchParams.get("status") ?? undefined,
      role: url.searchParams.get("role") ?? undefined,
      sortBy: url.searchParams.get("sortBy") ?? undefined,
      sortOrder: url.searchParams.get("sortOrder") ?? undefined,
    });

    const { users, total } = await fetchUsers(query);

    const payload = paginatedUserResponseSchema.parse({
      users: users.map(serializeUser),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    });

    return NextResponse.json(payload);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireUserWithPermission("users:create", request.headers);
    const body = await request.json();
    const payload = createUserSchema.parse(body);

    const [existing] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, payload.email))
      .limit(1);

    if (existing) {
      throw new BadRequestError(
        "A user with this email already exists. Try updating the existing account."
      );
    }

    const now = new Date();
    const role = payload.role ?? "user";
    assertRoleGrant(actor, role);

    const permissions = sanitizePermissions(
      payload.permissions as PermissionKey[] | undefined,
      role
    );
    assertPermissionGrant(actor, permissions);

    const username = await generateUniqueUsername(payload.email);
    const id = randomUUID();
    const shouldSendInvite = payload.sendInvite ?? true;

    const inviteMeta = shouldSendInvite
      ? {
          invitedAt: now,
          invitationToken: randomUUID(),
          invitationExpiresAt: new Date(
            now.getTime() + 7 * 24 * 60 * 60 * 1000
          ),
        }
      : {
          invitedAt: null,
          invitationToken: null,
          invitationExpiresAt: null,
        };

    const status: UserStatus = shouldSendInvite
      ? "invited"
      : payload.status ?? "active";

    await db.insert(schema.user).values({
      id,
      username,
      name: payload.name ?? username,
      email: payload.email,
      emailVerified: false,
      image: null,
      status,
      role,
      permissions,
      invitedAt: inviteMeta.invitedAt,
      invitationToken: inviteMeta.invitationToken,
      invitationExpiresAt: inviteMeta.invitationExpiresAt,
      createdAt: now,
      updatedAt: now,
    });

    const [createdUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, id))
      .limit(1);

    if (!createdUser) {
      throw new BadRequestError("Failed to create user");
    }

    await maybeSendInviteEmail({
      token: inviteMeta.invitationToken,
      email: payload.email,
      name: payload.name,
      inviterName: actor.name ?? actor.email ?? "RAMS Admin",
      shouldSend: shouldSendInvite,
    });

    const responseBody = userResponseSchema.parse(serializeUser(createdUser));

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

async function fetchUsers(query: UserQuery) {
  const filters = [];

  if (query.search) {
    const likeValue = `%${query.search}%`;
    filters.push(
      or(
        ilike(schema.user.name, likeValue),
        ilike(schema.user.email, likeValue),
        ilike(schema.user.username, likeValue)
      )
    );
  }

  if (typeof query.emailVerified === "boolean") {
    filters.push(eq(schema.user.emailVerified, query.emailVerified));
  }

  if (query.status) {
    filters.push(eq(schema.user.status, query.status));
  }

  if (query.role) {
    filters.push(eq(schema.user.role, query.role));
  }

  const whereClause =
    filters.length > 0 ? and(...filters) : undefined;

  const sortColumn =
    query.sortBy && SORT_COLUMNS[query.sortBy]
      ? SORT_COLUMNS[query.sortBy]
      : schema.user.createdAt;

  const orderBy =
    query.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const usersQueryBuilder = db.select().from(schema.user);
  const countQueryBuilder = db
    .select({ value: sql<number>`count(*)` })
    .from(schema.user);

  const filteredUsersQuery = whereClause
    ? usersQueryBuilder.where(whereClause)
    : usersQueryBuilder;

  const filteredCountQuery = whereClause
    ? countQueryBuilder.where(whereClause)
    : countQueryBuilder;

  const paginatedUsersQuery = filteredUsersQuery
    .orderBy(orderBy)
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize);

  const [users, [{ value: total }]] = await Promise.all([
    paginatedUsersQuery,
    filteredCountQuery,
  ]);

  return {
    users,
    total: Number(total ?? 0),
  };
}

const SORT_COLUMNS: Record<string, any> = {
  name: schema.user.name,
  email: schema.user.email,
  createdAt: schema.user.createdAt,
  updatedAt: schema.user.updatedAt,
  role: schema.user.role,
  status: schema.user.status,
};

async function maybeSendInviteEmail({
  token,
  email,
  name,
  inviterName,
  shouldSend,
}: {
  token?: string | null;
  email: string;
  name?: string | null;
  inviterName: string;
  shouldSend: boolean;
}) {
  if (!shouldSend || !token) {
    return;
  }

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

function parseNumber(value: string | null) {
  if (value === null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseBoolean(value: string | null) {
  if (value === null) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}


