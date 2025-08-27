import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'student' or 'restaurant'
  name: text("name").notNull(),
  studentId: text("student_id"), // only for students
  businessLicense: text("business_license"), // only for restaurants
  campusLocation: text("campus_location"), // only for restaurants
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  cuisine: text("cuisine").notNull(),
  rating: decimal("rating").default("0"),
  deliveryTime: text("delivery_time").notNull(),
  priceForTwo: integer("price_for_two").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
});

export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  status: text("status").notNull(), // 'placed', 'preparing', 'ready', 'delivered', 'cancelled'
  totalAmount: decimal("total_amount").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  orderItems: text("order_items").notNull(), // JSON string of order items
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Student signup validation
export const studentSignupSchema = insertUserSchema.extend({
  email: z.string().email().refine((email) => email.endsWith("@srmist.edu.in"), {
    message: "Email must be from @srmist.edu.in domain",
  }),
  role: z.literal("student"),
  studentId: z.string().min(1, "Student ID is required"),
}).omit({ businessLicense: true, campusLocation: true });

// Restaurant signup validation
export const restaurantSignupSchema = insertUserSchema.extend({
  role: z.literal("restaurant"),
  businessLicense: z.string().min(1, "Business license is required"),
  campusLocation: z.string().min(1, "Campus location is required"),
}).omit({ studentId: true });

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type StudentSignup = z.infer<typeof studentSignupSchema>;
export type RestaurantSignup = z.infer<typeof restaurantSignupSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
