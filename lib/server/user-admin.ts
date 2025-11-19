import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";

import { db, type Database, schema } from "@/db";
import type { User } from "@/db/schema";
import type { PermissionKey } from "@/lib/permissions";

const MAX_USERNAME_LENGTH = 32;

export function serializeUser(record: User) {
  const permissions = Array.isArray(record.permissions)
    ? (record.permissions as PermissionKey[])
    : [];

  return {
    ...record,
    permissions,
  };
}

export async function generateUniqueUsername(
  email: string,
  tx: Database = db
): Promise<string> {
  const base = slugifyEmail(email);
  let candidate = base;
  let attempt = 1;

  while (true) {
    const [existing] = await tx
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.username, candidate))
      .limit(1);

    if (!existing) {
      return candidate;
    }

    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
}

type DbExecutor = Pick<Database, "select" | "update" | "insert">;

export async function upsertCredentialAccount(
  tx: DbExecutor,
  userId: string,
  passwordHash: string
) {
  const credentialProvider = "credential";

  const [existingAccount] = await tx
    .select()
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, userId),
        eq(schema.account.providerId, credentialProvider)
      )
    )
    .limit(1);

  const now = new Date();

  if (existingAccount) {
    await tx
      .update(schema.account)
      .set({
        password: passwordHash,
        updatedAt: now,
      })
      .where(eq(schema.account.id, existingAccount.id));
    return;
  }

  await tx.insert(schema.account).values({
    id: randomUUID(),
    userId,
    providerId: credentialProvider,
    accountId: userId,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  });
}

function slugifyEmail(email: string) {
  const [localPart] = email.split("@");
  const cleaned = localPart
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  const fallback = "user";
  const value = cleaned.length ? cleaned : fallback;
  return value.slice(0, MAX_USERNAME_LENGTH);
}


