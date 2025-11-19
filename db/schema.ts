import {
  pgEnum,
  pgTable,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations, sql, type InferSelectModel } from "drizzle-orm";

export const userStatusEnum = pgEnum("user_status", [
  "invited",
  "active",
  "inactive",
  "suspended",
]);

export const userRoleEnum = pgEnum("user_role", [
  "superadmin",
  "admin",
  "user",
]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    status: userStatusEnum("status").notNull().default("active"),
    role: userRoleEnum("role").notNull().default("user"),
    permissions: jsonb("permissions")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    invitedAt: timestamp("invitedAt", { mode: "date" }),
    invitationToken: text("invitationToken"),
    invitationExpiresAt: timestamp("invitationExpiresAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex("user_username_key").on(table.username),
    emailIdx: uniqueIndex("user_email_key").on(table.email),
    invitationTokenIdx: uniqueIndex("user_invitation_token_key").on(
      table.invitationToken
    ),
  })
);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    mode: "date",
  }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
    mode: "date",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    tokenIdx: uniqueIndex("session_token_key").on(table.token),
  })
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const schema = {
  user,
  account,
  session,
  verification,
};

export type User = InferSelectModel<typeof user>;

