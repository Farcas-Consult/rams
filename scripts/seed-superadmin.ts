import "dotenv/config";

import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db, pool, schema } from "@/db";

const SUPERADMIN_EMAIL = "festusgitahik@gmail.com";
const SUPERADMIN_PASSWORD = "changeme";
const SUPERADMIN_NAME = "Super Admin";

async function seedSuperAdmin() {
  const now = new Date();
  const passwordHash = await hashPassword(SUPERADMIN_PASSWORD);

  const [existingUser] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, SUPERADMIN_EMAIL))
    .limit(1);

  const userId = existingUser?.id ?? randomUUID();

  await db.transaction(async (tx) => {
    if (existingUser) {
      await tx
        .update(schema.user)
        .set({
          name: existingUser.name ?? SUPERADMIN_NAME,
          emailVerified: true,
          updatedAt: now,
        })
        .where(eq(schema.user.id, existingUser.id));
    } else {
      await tx.insert(schema.user).values({
        id: userId,
        name: SUPERADMIN_NAME,
        email: SUPERADMIN_EMAIL,
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    const [credentialAccount] = await tx
      .select()
      .from(schema.account)
      .where(
        and(
          eq(schema.account.userId, userId),
          eq(schema.account.providerId, "credential"),
        ),
      )
      .limit(1);

    if (credentialAccount) {
      await tx
        .update(schema.account)
        .set({
          password: passwordHash,
          updatedAt: now,
        })
        .where(eq(schema.account.id, credentialAccount.id));
    } else {
      await tx.insert(schema.account).values({
        id: randomUUID(),
        userId,
        providerId: "credential",
        accountId: userId,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  console.info(`✅ Super admin ready at ${SUPERADMIN_EMAIL}`);
}

seedSuperAdmin()
  .catch((error) => {
    console.error("Failed to seed super admin", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

