import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const now = () => new Date();

export const userRole = pgEnum("user_role", ["admin", "user"]);
export const whitelistStatus = pgEnum("whitelist_status", [
  "active",
  "revoked",
]);
export const videoStatus = pgEnum("video_status", [
  "processing",
  "ready",
  "failed",
  "deleted",
]);

export const user = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    role: userRole("role").notNull().default("user"),
    banned: boolean("banned").notNull().default(false),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires"),
    createdAt: timestamp("createdAt").notNull().$defaultFn(now),
    updatedAt: timestamp("updatedAt").notNull().$defaultFn(now),
  },
  (table) => [uniqueIndex("user_email_unique").on(table.email)],
);

export const session = pgTable(
  "session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("createdAt").notNull().$defaultFn(now),
    updatedAt: timestamp("updatedAt").notNull().$defaultFn(now),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonatedBy"),
  },
  (table) => [uniqueIndex("session_token_unique").on(table.token)],
);

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt").notNull().$defaultFn(now),
});

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt").notNull().$defaultFn(now),
});

export const whitelistEmail = pgTable(
  "whitelist_email",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    status: whitelistStatus("status").notNull().default("active"),
    role: userRole("role").notNull().default("user"),
    addedByAdminId: text("addedByAdminId").references(() => user.id, {
      onDelete: "set null",
    }),
    revokedByAdminId: text("revokedByAdminId").references(() => user.id, {
      onDelete: "set null",
    }),
    revokedAt: timestamp("revokedAt"),
    note: text("note"),
    createdAt: timestamp("createdAt").notNull().$defaultFn(now),
    updatedAt: timestamp("updatedAt").notNull().$defaultFn(now),
  },
  (table) => [uniqueIndex("whitelist_email_email_unique").on(table.email)],
);

export const category = pgTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  parentId: text("parentId").references((): AnyPgColumn => category.id, {
    onDelete: "restrict",
  }),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdByAdminId: text("createdByAdminId").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("createdAt").notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt").notNull().$defaultFn(now),
});

export const video = pgTable("video", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: text("categoryId")
    .notNull()
    .references(() => category.id, { onDelete: "restrict" }),
  bunnyLibraryId: text("bunnyLibraryId").notNull(),
  bunnyVideoId: text("bunnyVideoId").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  duration: integer("duration"),
  status: videoStatus("status").notNull().default("processing"),
  uploadedByAdminId: text("uploadedByAdminId").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("createdAt").notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt").notNull().$defaultFn(now),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  whitelistEmailsAdded: many(whitelistEmail, {
    relationName: "whitelist_added_by_admin",
  }),
  whitelistEmailsRevoked: many(whitelistEmail, {
    relationName: "whitelist_revoked_by_admin",
  }),
  categoriesCreated: many(category),
  videosUploaded: many(video),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const whitelistEmailRelations = relations(whitelistEmail, ({ one }) => ({
  addedByAdmin: one(user, {
    fields: [whitelistEmail.addedByAdminId],
    references: [user.id],
    relationName: "whitelist_added_by_admin",
  }),
  revokedByAdmin: one(user, {
    fields: [whitelistEmail.revokedByAdminId],
    references: [user.id],
    relationName: "whitelist_revoked_by_admin",
  }),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: "category_tree",
  }),
  children: many(category, {
    relationName: "category_tree",
  }),
  createdByAdmin: one(user, {
    fields: [category.createdByAdminId],
    references: [user.id],
  }),
  videos: many(video),
}));

export const videoRelations = relations(video, ({ one }) => ({
  category: one(category, {
    fields: [video.categoryId],
    references: [category.id],
  }),
  uploadedByAdmin: one(user, {
    fields: [video.uploadedByAdminId],
    references: [user.id],
  }),
}));
