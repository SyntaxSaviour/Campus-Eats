import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'student', 'restaurant', or 'delivery'
  name: text("name").notNull(),
  phone: text("phone"),
  isVerified: boolean("is_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull().unique(),
  dormitory: text("dormitory"),
  roomNumber: text("room_number"),
  mealPlan: text("meal_plan"), // 'basic', 'premium', 'unlimited'
  dietaryRestrictions: text("dietary_restrictions").array(),
  emergencyContact: text("emergency_contact"),
  graduationYear: integer("graduation_year"),
  major: text("major"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  cuisine: text("cuisine").notNull(),
  businessLicense: text("business_license").notNull(),
  campusLocation: text("campus_location").notNull(),
  address: text("address"),
  rating: decimal("rating").default("0"),
  reviewCount: integer("review_count").default(0),
  deliveryTime: text("delivery_time").notNull(),
  priceForTwo: integer("price_for_two").notNull(),
  imageUrl: text("image_url"),
  coverImageUrl: text("cover_image_url"),
  operatingHours: json("operating_hours"), // { monday: { open: "09:00", close: "22:00" }, ... }
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  minimumOrder: integer("minimum_order").default(0),
  deliveryFee: integer("delivery_fee").default(0),
  preparationTime: integer("preparation_time").default(30), // in minutes
  stripeAccountId: text("stripe_account_id"), // Stripe Connect account ID
  stripeAccountStatus: text("stripe_account_status").default("pending"), // pending, active, restricted
  commissionRate: decimal("commission_rate").default("0.15"), // Platform commission (15%)
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  dietaryTags: text("dietary_tags").array(), // ['vegetarian', 'vegan', 'gluten-free', 'spicy', 'dairy-free']
  allergens: text("allergens").array(), // ['nuts', 'dairy', 'eggs', 'soy', 'gluten']
  nutritionInfo: json("nutrition_info"), // { calories: 450, protein: 25, carbs: 30, fat: 20 }
  preparationTime: integer("preparation_time").default(15), // in minutes
  spiceLevel: integer("spice_level").default(0), // 0-5 scale
  isAvailable: boolean("is_available").default(true),
  isPopular: boolean("is_popular").default(false),
  discount: integer("discount").default(0), // percentage discount
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: "restrict" }),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "restrict" }),
  status: text("status").notNull(), // 'placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'
  paymentStatus: text("payment_status").notNull().default('pending'), // 'pending', 'paid', 'failed', 'refunded'
  paymentMethod: text("payment_method"), // 'cash', 'card', 'upi', 'wallet'
  subtotal: decimal("subtotal").notNull(),
  deliveryFee: decimal("delivery_fee").notNull().default('0'),
  tax: decimal("tax").notNull().default('0'),
  discount: decimal("discount").notNull().default('0'),
  totalAmount: decimal("total_amount").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryInstructions: text("delivery_instructions"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  orderItems: json("order_items").notNull(), // Array of order items with details
  specialInstructions: text("special_instructions"),
  cancellationReason: text("cancellation_reason"),
  rating: integer("rating"), // 1-5 rating after delivery
  review: text("review"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeTransferId: text("stripe_transfer_id"),
  platformFee: decimal("platform_fee"),
  restaurantPayout: decimal("restaurant_payout"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const deliveryPersonnel = pgTable("delivery_personnel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  employeeId: text("employee_id").notNull().unique(),
  licenseNumber: text("license_number"),
  vehicleType: text("vehicle_type"), // 'bicycle', 'motorcycle', 'car'
  vehicleNumber: text("vehicle_number"),
  isAvailable: boolean("is_available").default(true),
  currentLocation: json("current_location"), // { lat: 12.34, lng: 56.78 }
  rating: decimal("rating").default("5.0"),
  completedDeliveries: integer("completed_deliveries").default(0),
  emergencyContact: text("emergency_contact"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  deliveryPersonId: varchar("delivery_person_id").references(() => deliveryPersonnel.id),
  status: text("status").notNull().default('pending'), // 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'
  assignedAt: timestamp("assigned_at"),
  pickedUpAt: timestamp("picked_up_at"),
  deliveredAt: timestamp("delivered_at"),
  estimatedDistance: decimal("estimated_distance"), // in kilometers
  actualDistance: decimal("actual_distance"),
  estimatedTime: integer("estimated_time"), // in minutes
  actualTime: integer("actual_time"),
  deliveryFee: decimal("delivery_fee").notNull(),
  tips: decimal("tips").default('0'),
  trackingUpdates: json("tracking_updates"), // Array of location/time updates
  deliveryProof: text("delivery_proof"), // Photo or signature URL
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryPersonnelSchema = createInsertSchema(deliveryPersonnel).omit({
  id: true,
  createdAt: true,
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Student signup validation
export const studentSignupSchema = z.object({
  email: z.string().email().refine((email) => email.endsWith("@srmist.edu.in"), {
    message: "Email must be from @srmist.edu.in domain",
  }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  role: z.literal("student"),
  // Student-specific fields
  studentId: z.string().min(1, "Student ID is required"),
  dormitory: z.string().optional(),
  roomNumber: z.string().optional(),
  mealPlan: z.enum(["basic", "premium", "unlimited"]).optional(),
  major: z.string().optional(),
  graduationYear: z.number().optional(),
});

// Restaurant signup validation
export const restaurantSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Restaurant name is required"),
  phone: z.string().optional(),
  role: z.literal("restaurant"),
  // Restaurant-specific fields
  businessLicense: z.string().min(1, "Business license is required"),
  campusLocation: z.string().min(1, "Campus location is required"),
  description: z.string().optional(),
  cuisine: z.string().min(1, "Cuisine type is required"),
  address: z.string().optional(),
});

// Delivery personnel signup validation
export const deliverySignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.literal("delivery"),
  // Delivery-specific fields
  employeeId: z.string().min(1, "Employee ID is required"),
  licenseNumber: z.string().optional(),
  vehicleType: z.enum(["bicycle", "motorcycle", "car"]).optional(),
  vehicleNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
});

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
export type DeliverySignup = z.infer<typeof deliverySignupSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertDeliveryPersonnel = z.infer<typeof insertDeliveryPersonnelSchema>;
export type DeliveryPersonnel = typeof deliveryPersonnel.$inferSelect;

export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveries.$inferSelect;
