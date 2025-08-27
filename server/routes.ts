import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  studentSignupSchema, 
  restaurantSignupSchema, 
  loginSchema,
  insertRestaurantSchema,
  insertMenuItemSchema,
  insertOrderSchema
} from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/student/signup", async (req, res) => {
    try {
      const validatedData = studentSignupSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser(validatedData);
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/restaurant/signup", async (req, res) => {
    try {
      const validatedData = restaurantSignupSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser(validatedData);
      
      // Create restaurant profile
      const restaurant = await storage.createRestaurant({
        userId: user.id,
        name: user.name,
        description: "",
        cuisine: "Various",
        deliveryTime: "30-45 min",
        priceForTwo: 500,
        imageUrl: "",
        businessLicense: "TEMP-LICENSE",
        campusLocation: "Main Campus",
      });
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, restaurant });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Get restaurant data if user is a restaurant owner
      let restaurant = null;
      if (user.role === "restaurant") {
        restaurant = await storage.getRestaurantByUserId(user.id);
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, restaurant });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Restaurant routes
  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/restaurants/:id", async (req, res) => {
    try {
      const updates = req.body;
      const restaurant = await storage.updateRestaurant(req.params.id, updates);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Menu routes
  app.get("/api/restaurants/:restaurantId/menu", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems(req.params.restaurantId);
      res.json(menuItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/restaurants/:restaurantId/menu", async (req, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse({
        ...req.body,
        restaurantId: req.params.restaurantId,
      });
      
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/menu-items/:id", async (req, res) => {
    try {
      const updates = req.body;
      const menuItem = await storage.updateMenuItem(req.params.id, updates);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    try {
      const success = await storage.deleteMenuItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe Connect routes
  app.post("/api/restaurants/:id/create-connect-account", async (req, res) => {
    try {
      const restaurantId = req.params.id;
      const restaurant = await storage.getRestaurant(restaurantId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Create Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'IN',
        email: restaurant.name + '@campuseats.com',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Update restaurant with Stripe account ID
      await storage.updateRestaurant(restaurantId, {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending'
      });

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.headers.origin}/restaurant/dashboard`,
        return_url: `${req.headers.origin}/restaurant/dashboard`,
        type: 'account_onboarding',
      });

      res.json({ accountLink: accountLink.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment Intent for orders with marketplace fee
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { orderId, amount, restaurantId } = req.body;
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || !restaurant.stripeAccountId) {
        return res.status(400).json({ message: "Restaurant Stripe account not set up" });
      }

      const platformFee = Math.round(amount * parseFloat(restaurant.commissionRate || "0.15"));
      const restaurantAmount = amount - platformFee;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'inr',
        application_fee_amount: platformFee * 100,
        transfer_data: {
          destination: restaurant.stripeAccountId,
        },
        metadata: {
          orderId,
          restaurantId,
          platformFee: platformFee.toString(),
          restaurantAmount: restaurantAmount.toString(),
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        platformFee,
        restaurantAmount
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/orders/student/:studentId", async (req, res) => {
    try {
      const orders = await storage.getOrdersByStudent(req.params.studentId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/restaurant/:restaurantId", async (req, res) => {
    try {
      const orders = await storage.getOrdersByRestaurant(req.params.restaurantId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const updates = req.body;
      const order = await storage.updateOrder(req.params.id, updates);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
