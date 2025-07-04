import type { AdapterAccountType } from "@auth/core/adapters";
import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  geometry,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

const foreignId = () => varchar({ length: 64 });
const id = () =>
  varchar({ length: 64 })
    .primaryKey()
    .$defaultFn(() => createId());

export const events = pgTable(
  "events",
  {
    id: id(),
    title: text().notNull(),
    description: text().notNull(),
    location: text().notNull(),
    start: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    end: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    images: text()
      .array()
      .notNull()
      .default([]),
    coverImageId: foreignId(),
    createdBy: foreignId()
      .references(() => organizations.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    deletedAt: timestamp({ withTimezone: true, mode: "date" }),
    updatedAt: timestamp({ withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("events_title_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.title})`,
    ),
    index("events_deleted_null_idx")
      .on(table.id)
      .where(sql`${table.deletedAt} IS NULL`),
    index("events_updated_at_idx").on(table.updatedAt),
  ],
);

export const posts = pgTable(
  "posts",
  {
    id: id(),
    title: text().notNull(),
    eventId: foreignId()
      .notNull()
      .references(() => events.id, {
        onDelete: "cascade",
      }),
    createdBy: foreignId().references(() => organizations.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp({ withTimezone: true, mode: "date" }),
    deletedAt: timestamp({ withTimezone: true, mode: "date" }),
    updatedAt: timestamp({ withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("posts_title_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.title})`,
    ),
    index("posts_deleted_null_idx")
      .on(table.id)
      .where(sql`${table.deletedAt} IS NULL`),
    index("posts_updated_at_idx").on(table.updatedAt),
  ],
);

export const images = pgTable(
  "images",
  {
    id: id(),
    createdBy: foreignId().references(() => organizations.id, {
      onDelete: "cascade",
    }),
    fileName: text().notNull(),
    mimeType: text().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("images_created_at_idx").on(table.createdAt)],
);

export const towns = pgTable("towns", {
  id: id(),
  name: varchar({ length: 64 }).notNull(),
  municipality: varchar({ length: 64 }).notNull(),
  location: geometry({ type: "point", mode: "tuple", srid: 4326 }).notNull(),
});

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text().notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    name: text(),
    image: text(),
    currentRoleId: foreignId().references((): AnyPgColumn => roles.id, {
      onDelete: "set null",
    }),
  },
  (table) => [unique().on(table.email)],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    userId: foreignId()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    townId: foreignId()
      .notNull()
      .references(() => towns.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.townId] })],
);

export const mutes = pgTable(
  "mutes",
  {
    userId: foreignId()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: foreignId()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.organizationId] })],
);

export const organizations = pgTable(
  "organizations",
  {
    id: id(),
    vatId: foreignId().notNull().default(""),
    name: text().notNull(),
    phone: text(),
    presentation: text().notNull().default(""),
    address: text().notNull(),
    isCharity: boolean().notNull(),
    postCode: varchar({ length: 4 }).notNull(),
    townId: foreignId()
      .notNull()
      .references(() => towns.id, { onDelete: "cascade" }),
    imageId: foreignId(),
    presentationImages: text()
      .array()
      .notNull()
      .default([]),
    createdBy: foreignId().references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp({ withTimezone: true, mode: "date" }),
    deletedAt: timestamp({ withTimezone: true, mode: "date" }),
    updatedAt: timestamp({ withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.vatId)],
);

export const roles = pgTable(
  "roles",
  {
    id: id(),
    userId: foreignId()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    organizationId: foreignId()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),
    userGroups: text().array().notNull(),
  },
  (table) => [unique().on(table.userId, table.organizationId)],
);

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ],
);

export const rolesRelations = relations(roles, ({ one }) => ({
  user: one(users, {
    fields: [roles.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  currentRole: one(roles, {
    fields: [users.currentRoleId],
    references: [roles.id],
  }),
}));

export const organizationRelations = relations(organizations, ({ one }) => ({
  town: one(towns, {
    fields: [organizations.townId],
    references: [towns.id],
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  town: one(towns, {
    fields: [subscriptions.townId],
    references: [towns.id],
  }),
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const eventRelations = relations(events, ({ one, many }) => ({
  createdByOrg: one(organizations, {
    fields: [events.createdBy],
    references: [organizations.id],
  }),
  coverImage: one(images, {
    fields: [events.coverImageId],
    references: [images.id],
  }),
}));
