import { 
  type User, 
  type InsertUser, 
  type Restaurant, 
  type InsertRestaurant,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  users,
  restaurants,
  menuItems,
  orders
} from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, sql } from 'drizzle-orm';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Restaurant methods
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantByUserId(userId: string): Promise<Restaurant | undefined>;
  getRestaurants(): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | undefined>;
  
  // Menu item methods
  getMenuItems(restaurantId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: string): Promise<boolean>;
  
  // Order methods
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByStudent(studentId: string): Promise<Order[]>;
  getOrdersByRestaurant(restaurantId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
}

// Database storage implementation using Supabase
export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not provided");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
    this.seedData();
  }

  private async seedData() {
    try {
      // Check if data already exists
      const existingRestaurants = await this.db.execute(sql`SELECT COUNT(*) as count FROM restaurants`);
      if (Number(existingRestaurants.rows[0]?.count) > 0) {
        return; // Data already seeded
      }

      console.log("Seeding database with initial data...");
    } catch (error) {
      console.log("Database seeding error (continuing with app):", (error as Error).message);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  // Restaurant methods
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await this.db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async getRestaurantByUserId(userId: string): Promise<Restaurant | undefined> {
    const [restaurant] = await this.db.select().from(restaurants).where(eq(restaurants.userId, userId));
    return restaurant;
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return await this.db.select().from(restaurants).where(eq(restaurants.isActive, true));
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await this.db.insert(restaurants).values(insertRestaurant).returning();
    return restaurant;
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | undefined> {
    const [restaurant] = await this.db.update(restaurants).set(updates).where(eq(restaurants.id, id)).returning();
    return restaurant;
  }

  // Menu item methods
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return await this.db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const [item] = await this.db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const [item] = await this.db.insert(menuItems).values(insertItem).returning();
    return item;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const [item] = await this.db.update(menuItems).set(updates).where(eq(menuItems.id, id)).returning();
    return item;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    const result = await this.db.delete(menuItems).where(eq(menuItems.id, id)).returning();
    return result.length > 0;
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByStudent(studentId: string): Promise<Order[]> {
    return await this.db.select().from(orders).where(eq(orders.studentId, studentId));
  }

  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    return await this.db.select().from(orders).where(eq(orders.restaurantId, restaurantId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await this.db.insert(orders).values([insertOrder]).returning();
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const [order] = await this.db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return order;
  }
}

// Fallback in-memory storage for development
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private restaurants: Map<string, Restaurant> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private orders: Map<string, Order> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed restaurant users
    const pizzaPalaceUser: User = {
      id: randomUUID(),
      email: "pizzapalace@restaurant.com",
      password: "password123",
      role: "restaurant",
      name: "Pizza Palace",
      phone: null,
      isVerified: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const desiDhabaUser: User = {
      id: randomUUID(),
      email: "desidhaba@restaurant.com", 
      password: "password123",
      role: "restaurant",
      name: "Desi Dhaba",
      phone: null,
      isVerified: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(pizzaPalaceUser.id, pizzaPalaceUser);
    this.users.set(desiDhabaUser.id, desiDhabaUser);

    // Seed restaurants
    const pizzaPalace: Restaurant = {
      id: randomUUID(),
      userId: pizzaPalaceUser.id,
      name: "Pizza Palace",
      description: "Authentic Italian pizzas made fresh",
      cuisine: "Italian",
      businessLicense: "LIC001",
      campusLocation: "Food Court",
      address: null,
      rating: "4.8",
      reviewCount: 0,
      deliveryTime: "15-25 min",
      priceForTwo: 400,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      coverImageUrl: null,
      operatingHours: null,
      isActive: true,
      isVerified: true,
      minimumOrder: 0,
      deliveryFee: 0,
      preparationTime: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const desiDhaba: Restaurant = {
      id: randomUUID(),
      userId: desiDhabaUser.id,
      name: "Desi Dhaba",
      description: "Traditional North Indian cuisine",
      cuisine: "North Indian",
      businessLicense: "LIC002",
      campusLocation: "Near Hostel Block A",
      address: null,
      rating: "4.6",
      reviewCount: 0,
      deliveryTime: "20-30 min",
      priceForTwo: 300,
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      coverImageUrl: null,
      operatingHours: null,
      isActive: true,
      isVerified: true,
      minimumOrder: 0,
      deliveryFee: 0,
      preparationTime: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.restaurants.set(pizzaPalace.id, pizzaPalace);
    this.restaurants.set(desiDhaba.id, desiDhaba);

    // Seed menu items
    const margheritaPizza: MenuItem = {
      id: randomUUID(),
      restaurantId: pizzaPalace.id,
      name: "Margherita Pizza",
      description: "Fresh tomato, mozzarella, basil",
      price: "249",
      category: "Pizza",
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      dietaryTags: null,
      allergens: null,
      nutritionInfo: null,
      preparationTime: 15,
      spiceLevel: 0,
      isAvailable: true,
      isPopular: false,
      discount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const pepperoniPizza: MenuItem = {
      id: randomUUID(),
      restaurantId: pizzaPalace.id,
      name: "Pepperoni Pizza",
      description: "Pepperoni, mozzarella, tomato sauce",
      price: "320",
      category: "Pizza", 
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      dietaryTags: null,
      allergens: null,
      nutritionInfo: null,
      preparationTime: 15,
      spiceLevel: 0,
      isAvailable: true,
      isPopular: false,
      discount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const butterChicken: MenuItem = {
      id: randomUUID(),
      restaurantId: desiDhaba.id,
      name: "Butter Chicken",
      description: "Creamy tomato curry with tender chicken",
      price: "280",
      category: "Main Course",
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      dietaryTags: null,
      allergens: null,
      nutritionInfo: null,
      preparationTime: 20,
      spiceLevel: 2,
      isAvailable: true,
      isPopular: true,
      discount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.menuItems.set(margheritaPizza.id, margheritaPizza);
    this.menuItems.set(pepperoniPizza.id, pepperoniPizza);
    this.menuItems.set(butterChicken.id, butterChicken);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      phone: insertUser.phone || null,
      isVerified: insertUser.isVerified || null,
      emailVerified: insertUser.emailVerified || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Restaurant methods
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async getRestaurantByUserId(userId: string): Promise<Restaurant | undefined> {
    return Array.from(this.restaurants.values()).find(restaurant => restaurant.userId === userId);
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(restaurant => restaurant.isActive);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = randomUUID();
    const restaurant: Restaurant = {
      ...insertRestaurant,
      id,
      description: insertRestaurant.description || null,
      imageUrl: insertRestaurant.imageUrl || null,
      rating: insertRestaurant.rating || null,

      isVerified: insertRestaurant.isVerified || null,
      preparationTime: insertRestaurant.preparationTime || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | undefined> {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) return undefined;
    
    const updatedRestaurant = { ...restaurant, ...updates };
    this.restaurants.set(id, updatedRestaurant);
    return updatedRestaurant;
  }

  // Menu item methods
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.restaurantId === restaurantId);
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = randomUUID();
    const item: MenuItem = {
      ...insertItem,
      id,
      description: insertItem.description || null,
      imageUrl: insertItem.imageUrl || null,
      preparationTime: insertItem.preparationTime || null,
      dietaryTags: insertItem.dietaryTags || null,
      allergens: insertItem.allergens || null,
      nutritionInfo: insertItem.nutritionInfo || null,
      spiceLevel: insertItem.spiceLevel || null,
      discount: insertItem.discount || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.menuItems.set(id, item);
    return item;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const item = this.menuItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    return this.menuItems.delete(id);
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByStudent(studentId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.studentId === studentId);
  }

  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.restaurantId === restaurantId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const order: Order = {
      ...insertOrder,
      id,
      orderNumber,
      rating: insertOrder.rating || null,
      deliveryFee: insertOrder.deliveryFee || "30",
      discount: insertOrder.discount || "0",

      estimatedDeliveryTime: insertOrder.estimatedDeliveryTime || null,
      actualDeliveryTime: insertOrder.actualDeliveryTime || null,

      review: insertOrder.review || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

// Use in-memory storage for now, can switch to database later
export const storage = new MemStorage();
