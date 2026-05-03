import { pgTable, serial, text, integer, numeric, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productQualityEnum = pgEnum("product_quality", ["premium", "standard", "backing_track", "demo"]);
export const productStatusEnum = pgEnum("product_status", ["active", "inactive", "draft", "featured"]);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  tonality: text("tonality"),
  bpm: integer("bpm"),
  duration: text("duration"),
  description: text("description").notNull().default(""),
  tracks: text("tracks").array().notNull().default([]),
  formats: text("formats").array().notNull().default([]),
  fileSizeMb: numeric("file_size_mb", { precision: 10, scale: 2 }),
  coverUrl: text("cover_url"),
  previewAudioUrl: text("preview_audio_url"),
  videoUrl: text("video_url"),
  tags: text("tags").array().notNull().default([]),
  licenceSummary: text("licence_summary"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  promoPrice: numeric("promo_price", { precision: 10, scale: 2 }),
  promoPriceStartAt: timestamp("promo_price_start_at"),
  promoPriceEndAt: timestamp("promo_price_end_at"),
  quality: productQualityEnum("quality").notNull().default("standard"),
  status: productStatusEnum("status").notNull().default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  availableForSale: boolean("available_for_sale").notNull().default(true),
  availableForSubscription: boolean("available_for_subscription").notNull().default(true),
  creditsRequired: integer("credits_required").notNull().default(1),
  totalSales: integer("total_sales").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true, totalSales: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
