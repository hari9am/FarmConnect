import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<"farmer" | "customer">(),
  language: text("language").notNull().default("english"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const farmers = pgTable("farmers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  kissanNumber: text("kissan_number").notNull(),
  bankAccountNumber: text("bank_account_number"),
  ifscCode: text("ifsc_code"),
  upiId: text("upi_id"),
  stripeCustomerId: text("stripe_customer_id"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  stripeCustomerId: text("stripe_customer_id"),
});

export const crops = pgTable("crops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull().default("kg"),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  images: jsonb("images").$type<string[]>().default([]),
  location: jsonb("location").$type<{ lat: number; lng: number; address: string }>(),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  cropId: varchar("crop_id").notNull().references(() => crops.id),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  cropId: varchar("crop_id").notNull().references(() => crops.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  farmer: one(farmers, {
    fields: [users.id],
    references: [farmers.userId],
  }),
  customer: one(customers, {
    fields: [users.id],
    references: [customers.userId],
  }),
}));

export const farmersRelations = relations(farmers, ({ one, many }) => ({
  user: one(users, {
    fields: [farmers.userId],
    references: [users.id],
  }),
  crops: many(crops),
  reviews: many(reviews),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  orders: many(orders),
  reviews: many(reviews),
}));

export const cropsRelations = relations(crops, ({ one, many }) => ({
  farmer: one(farmers, {
    fields: [crops.farmerId],
    references: [farmers.id],
  }),
  orders: many(orders),
  reviews: many(reviews),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  crop: one(crops, {
    fields: [orders.cropId],
    references: [crops.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  customer: one(customers, {
    fields: [reviews.customerId],
    references: [customers.id],
  }),
  farmer: one(farmers, {
    fields: [reviews.farmerId],
    references: [farmers.id],
  }),
  crop: one(crops, {
    fields: [reviews.cropId],
    references: [crops.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertFarmerSchema = createInsertSchema(farmers).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertCropSchema = createInsertSchema(crops).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type Farmer = typeof farmers.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Crop = typeof crops.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Review = typeof reviews.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertCrop = z.infer<typeof insertCropSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
