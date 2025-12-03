import {
  pgEnum,
  pgTable,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  jsonb,
  numeric,
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

export const assetOriginEnum = pgEnum("asset_origin", [
  "inventory",
  "import",
  "discovered",
]);

export const assetDiscoveryStatusEnum = pgEnum("asset_discovery_status", [
  "catalogued",
  "pending_review",
  "undiscovered",
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

export const asset = pgTable(
  "asset",
  {
    id: text("id").primaryKey(),
    plnt: text("plnt"),
    equipment: text("equipment"),
    material: text("material"),
    materialDescription: text("materialDescription"),
    techIdentNo: text("techIdentNo"),
    assetTag: text("assetTag"),
    assetName: text("assetName").notNull(),
    category: text("category"),
    location: text("location"),
    status: text("status"),
    origin: assetOriginEnum("origin").notNull().default("inventory"),
    discoveryStatus: assetDiscoveryStatusEnum("discoveryStatus")
      .notNull()
      .default("catalogued"),
    assignedTo: text("assignedTo"),
    purchaseDate: timestamp("purchaseDate", { mode: "date" }),
    purchasePrice: numeric("purchasePrice", { precision: 14, scale: 2 }),
    serialNumber: text("serialNumber"),
    manufacturer: text("manufacturer"),
    model: text("model"),
    description: text("description"),
    manufSerialNumber: text("manufSerialNumber"),
    sysStatus: text("sysStatus"),
    userStatusRaw: text("userStatusRaw"),
    sLoc: text("sLoc"),
    pfUserAc: text("pfUserAc"),
    pfUserAccountableDescription: text("pfUserAccountableDescription"),
    pfPropMg: text("pfPropMg"),
    pfPropMgmFocalPointDescription: text("pfPropMgmFocalPointDescription"),
    functionalLoc: text("functionalLoc"),
    functionalLocDescription: text("functionalLocDescription"),
    aGrp: text("aGrp"),
    busA: text("busA"),
    objectType: text("objectType"),
    costCtr: text("costCtr"),
    acquistnValue: numeric("acquistnValue", { precision: 14, scale: 2 }),
    comment: text("comment"),
    isDecommissioned: boolean("isDecommissioned").notNull().default(false),
    decommissionedAt: timestamp("decommissionedAt", { mode: "date" }),
    decommissionReason: text("decommissionReason"),
    discoveredAt: timestamp("discoveredAt", { mode: "date" }),
    discoveryNotes: text("discoveryNotes"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (table) => ({
    assetTagIdx: uniqueIndex("asset_asset_tag_key").on(table.assetTag),
    serialNumberIdx: uniqueIndex("asset_serial_number_key").on(
      table.serialNumber
    ),
    equipmentIdx: uniqueIndex("asset_equipment_key").on(table.equipment),
  })
);

export const undiscoveredAsset = pgTable("undiscovered_asset", {
  id: text("id").primaryKey(),
  assetId: text("assetId").references(() => asset.id, { onDelete: "set null" }),
  externalIdentifier: text("externalIdentifier"),
  description: text("description"),
  location: text("location"),
  seenBy: text("seenBy"),
  seenAt: timestamp("seenAt", { mode: "date" }),
  mission: text("mission"),
  systemStatus: text("systemStatus"),
  userStatus: text("userStatus"),
  discoveryStatus: assetDiscoveryStatusEnum("discoveryStatus")
    .notNull()
    .default("undiscovered"),
  notes: text("notes"),
  payload: jsonb("payload")
    .$type<Record<string, unknown>>()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const rfidTag = pgTable(
  "rfid_tag",
  {
    id: text("id").primaryKey(),
    epc: text("epc").notNull(),
    assetId: text("asset_id")
      .notNull()
      .references(() => asset.id, { onDelete: "cascade" }),
    position: text("position"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    epcIdx: uniqueIndex("rfid_tag_epc_key").on(table.epc),
  })
);

export const readerEvent = pgTable("reader_event", {
  id: text("id").primaryKey(),
  epc: text("epc").notNull(),
  readerId: text("reader_id"),
  antenna: text("antenna"),
  gate: text("gate"),
  direction: text("direction"),
  seenAt: timestamp("seen_at", { mode: "date" }).notNull(),
  assetId: text("asset_id").references(() => asset.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const assetPresence = pgTable("asset_presence", {
  assetId: text("asset_id")
    .primaryKey()
    .references(() => asset.id, { onDelete: "cascade" }),
  lastSeenEpc: text("last_seen_epc").notNull(),
  lastSeenAt: timestamp("last_seen_at", { mode: "date" }).notNull(),
  lastSeenReaderId: text("last_seen_reader_id"),
  lastSeenGate: text("last_seen_gate"),
  lastSeenDirection: text("last_seen_direction"),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
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

export const assetRelations = relations(asset, ({ many }) => ({
  undiscoveredEntries: many(undiscoveredAsset),
}));

export const undiscoveredAssetRelations = relations(
  undiscoveredAsset,
  ({ one }) => ({
    asset: one(asset, {
      fields: [undiscoveredAsset.assetId],
      references: [asset.id],
    }),
  })
);

export const rfidTagRelations = relations(rfidTag, ({ one }) => ({
  asset: one(asset, {
    fields: [rfidTag.assetId],
    references: [asset.id],
  }),
}));

export const readerEventRelations = relations(readerEvent, ({ one }) => ({
  asset: one(asset, {
    fields: [readerEvent.assetId],
    references: [asset.id],
  }),
}));

export const schema = {
  user,
  account,
  session,
  verification,
  asset,
  undiscoveredAsset,
  rfidTag,
  readerEvent,
  assetPresence,
};

export type User = InferSelectModel<typeof user>;
export type Asset = InferSelectModel<typeof asset>;
export type UndiscoveredAsset = InferSelectModel<typeof undiscoveredAsset>;
export type RfidTag = InferSelectModel<typeof rfidTag>;
export type ReaderEvent = InferSelectModel<typeof readerEvent>;
