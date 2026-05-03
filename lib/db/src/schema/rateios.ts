import { pgTable, serial, integer, numeric, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const rateioStatusEnum = pgEnum("rateio_status", [
  "suggested", "in_quotation", "open", "goal_reached",
  "awaiting_payment", "payment_confirmed", "in_progress",
  "completed", "cancelled", "refunded"
]);

export const participantPaymentStatusEnum = pgEnum("participant_payment_status", ["pending", "paid", "overdue", "refunded"]);

export const rateiosTable = pgTable("rateios", {
  id: serial("id").primaryKey(),
  songName: text("song_name").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre"),
  reference: text("reference"),
  justification: text("justification"),
  status: rateioStatusEnum("status").notNull().default("suggested"),
  targetAmount: numeric("target_amount", { precision: 10, scale: 2 }),
  amountPerParticipant: numeric("amount_per_participant", { precision: 10, scale: 2 }),
  minParticipants: integer("min_participants"),
  minPercentage: numeric("min_percentage", { precision: 5, scale: 2 }),
  deadline: timestamp("deadline"),
  coverUrl: text("cover_url"),
  cancelReason: text("cancel_reason"),
  productId: integer("product_id").references(() => productsTable.id),
  suggestedByUserId: integer("suggested_by_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rateioParticipantsTable = pgTable("rateio_participants", {
  id: serial("id").primaryKey(),
  rateioId: integer("rateio_id").notNull().references(() => rateiosTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  paymentStatus: participantPaymentStatusEnum("payment_status").notNull().default("pending"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const rateioCommentsTable = pgTable("rateio_comments", {
  id: serial("id").primaryKey(),
  rateioId: integer("rateio_id").notNull().references(() => rateiosTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  isAdmin: boolean("is_admin").notNull().default(false),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Rateio = typeof rateiosTable.$inferSelect;
export type RateioParticipant = typeof rateioParticipantsTable.$inferSelect;
export type RateioComment = typeof rateioCommentsTable.$inferSelect;
