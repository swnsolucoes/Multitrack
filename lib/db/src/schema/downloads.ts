import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { productsTable } from "./products";
import { orderItemsTable } from "./orders";

export const downloadSourceEnum = pgEnum("download_source", ["purchase", "credit", "rateio"]);

export const downloadGrantsTable = pgTable("download_grants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  orderItemId: integer("order_item_id").references(() => orderItemsTable.id),
  source: downloadSourceEnum("source").notNull().default("purchase"),
  downloadCount: integer("download_count").notNull().default(0),
  lastDownloadAt: timestamp("last_download_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const downloadLogsTable = pgTable("download_logs", {
  id: serial("id").primaryKey(),
  grantId: integer("grant_id").notNull().references(() => downloadGrantsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DownloadGrant = typeof downloadGrantsTable.$inferSelect;
