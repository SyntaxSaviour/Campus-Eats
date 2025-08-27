import { 
  type User, 
  type InsertUser, 
  type Restaurant, 
  type InsertRestaurant,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private restaurants: Map<string, Restaurant> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private orders: Map<string, Order> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial restaurant users
    const pizzaPalaceUser: User = {
      id: randomUUID(),
      email: "pizzapalace@restaurant.com",
      password: "password123",
      role: "restaurant",
      name: "Pizza Palace",
      studentId: null,
      businessLicense: "LIC001",
      campusLocation: "Food Court",
      isVerified: true,
      createdAt: new Date(),
    };

    const desiDhabaUser: User = {
      id: randomUUID(),
      email: "desidhaba@restaurant.com", 
      password: "password123",
      role: "restaurant",
      name: "Desi Dhaba",
      studentId: null,
      businessLicense: "LIC002",
      campusLocation: "Near Hostel Block A",
      isVerified: true,
      createdAt: new Date(),
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
      rating: "4.8",
      deliveryTime: "15-25 min",
      priceForTwo: 400,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      isActive: true,
    };

    const desiDhaba: Restaurant = {
      id: randomUUID(),
      userId: desiDhabaUser.id,
      name: "Desi Dhaba",
      description: "Traditional North Indian cuisine",
      cuisine: "North Indian",
      rating: "4.6",
      deliveryTime: "20-30 min",
      priceForTwo: 300,
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      isActive: true,
    };

    this.restaurants.set(pizzaPalace.id, pizzaPalace);
    this.restaurants.set(desiDhaba.id, desiDhaba);

    // Seed menu items for Pizza Palace
    const margheritaPizza: MenuItem = {
      id: randomUUID(),
      restaurantId: pizzaPalace.id,
      name: "Margherita Pizza",
      description: "Fresh tomato, mozzarella, basil",
      price: "249",
      category: "Pizza",
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      isAvailable: true,
    };

    const pepperoniPizza: MenuItem = {
      id: randomUUID(),
      restaurantId: pizzaPalace.id,
      name: "Pepperoni Pizza",
      description: "Pepperoni, mozzarella, tomato sauce",
      price: "320",
      category: "Pizza", 
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      isAvailable: true,
    };

    this.menuItems.set(margheritaPizza.id, margheritaPizza);
    this.menuItems.set(pepperoniPizza.id, pepperoniPizza);

    // Seed menu items for Desi Dhaba
    const butterChicken: MenuItem = {
      id: randomUUID(),
      restaurantId: desiDhaba.id,
      name: "Butter Chicken",
      description: "Creamy tomato curry with tender chicken",
      price: "280",
      category: "Main Course",
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      isAvailable: true,
    };

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
      createdAt: new Date(),
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
    const order: Order = {
      ...insertOrder,
      id,
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

export const storage = new MemStorage();
