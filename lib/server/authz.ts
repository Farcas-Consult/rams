import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import type { User } from "@/db/schema";
import {
  PermissionKey,
  ROLE_DEFAULT_PERMISSIONS,
  UserRole,
} from "@/lib/permissions";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/server/errors";

export async function requireRequestUser(
  requestHeaders?: Headers
): Promise<User> {
  const resolvedHeaders =
    requestHeaders ?? new Headers(await headers());

  const session = await authUser(resolvedHeaders);

  const [dbUser] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, session.user.id))
    .limit(1);

  if (!dbUser) {
    throw new UnauthorizedError();
  }

  return dbUser;
}

async function authUser(resolvedHeaders: Headers) {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({
    headers: resolvedHeaders,
  });

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  return session;
}

export async function requireUserWithPermission(
  permission: PermissionKey,
  requestHeaders?: Headers
): Promise<User> {
  const user = await requireRequestUser(requestHeaders);
  assertCan(user, permission);
  return user;
}

export function hasPermission(user: Pick<User, "role" | "permissions">, permission: PermissionKey) {
  if (user.role === "superadmin") return true;
  return user.permissions.includes(permission);
}

export function assertCan(user: Pick<User, "role" | "permissions">, permission: PermissionKey) {
  if (!hasPermission(user, permission)) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }
}

export function assertRoleGrant(actor: Pick<User, "role">, targetRole: UserRole) {
  if (targetRole === "superadmin" && actor.role !== "superadmin") {
    throw new ForbiddenError("Only superadmins can assign the superadmin role");
  }

  if (targetRole === "admin" && actor.role === "user") {
    throw new ForbiddenError("Only admins or above can assign admin role");
  }
}

export function assertPermissionGrant(
  actor: Pick<User, "role" | "permissions">,
  permissions: PermissionKey[]
) {
  if (actor.role === "superadmin") {
    return;
  }

  const actorPermissions = new Set(actor.permissions);
  const isAllowed = permissions.every((permission) =>
    actorPermissions.has(permission)
  );

  if (!isAllowed) {
    throw new ForbiddenError("You cannot grant permissions you do not possess");
  }
}

export function sanitizePermissions(
  permissions: PermissionKey[] | undefined,
  fallbackRole: UserRole
): PermissionKey[] {
  if (permissions?.length) return Array.from(new Set(permissions));
  return ROLE_DEFAULT_PERMISSIONS[fallbackRole] ?? [];
}


