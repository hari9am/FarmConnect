import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertFarmerSchema, insertCustomerSchema, insertCropSchema, insertMessageSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set - payment functionality will be disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
}) : null;

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.sendStatus(403);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(userData.phone);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this phone number" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create farmer or customer profile
      if (userData.role === "farmer") {
        await storage.createFarmer({
          userId: user.id,
          kissanNumber: req.body.kissanNumber,
        });
      } else {
        await storage.createCustomer({
          userId: user.id,
        });
      }

      // Generate JWT
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          phone: user.phone, 
          role: user.role, 
          language: user.language 
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          phone: user.phone, 
          role: user.role, 
          language: user.language 
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Language preference
  app.patch("/api/user/language", authenticateToken, async (req, res) => {
    try {
      const { language } = req.body;
      const user = await storage.updateUserLanguage(req.user.id, language);
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Farmer routes
  app.get("/api/farmer/profile", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmer(req.user.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }
      res.json(farmer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/farmer/payment-details", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmer(req.user.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }

      const updatedFarmer = await storage.updateFarmerPaymentDetails(farmer.id, req.body);
      res.json(updatedFarmer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Crop routes
  app.get("/api/crops", async (req, res) => {
    try {
      const { lat, lng } = req.query;
      let crops;
      
      if (lat && lng) {
        crops = await storage.getCropsNearLocation(Number(lat), Number(lng));
      } else {
        // Return all active crops if no location provided
        crops = await storage.getCropsNearLocation(0, 0, 1000);
      }
      
      res.json(crops);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/crops/:id", async (req, res) => {
    try {
      const crop = await storage.getCrop(req.params.id);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      res.json(crop);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/farmer/crops", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmer(req.user.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }

      const crops = await storage.getCropsByFarmer(farmer.id);
      res.json(crops);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/crops", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmer(req.user.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }

      const cropData = insertCropSchema.parse({
        ...req.body,
        farmerId: farmer.id,
      });

      const crop = await storage.createCrop(cropData);
      res.json(crop);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Message routes
  app.get("/api/conversations", authenticateToken, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.user.id);
      res.json(conversations);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/messages/:otherUserId", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.user.id, req.params.otherUserId);
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });

      const message = await storage.createMessage(messageData);
      
      // Broadcast message via WebSocket
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            message,
          }));
        }
      });

      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/unread-count", authenticateToken, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.user.id);
      res.json({ count });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", authenticateToken, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Payment functionality is not available - Stripe not configured" });
      }
      
      const { amount, cropId, quantity } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "inr",
        metadata: {
          cropId,
          quantity: quantity.toString(),
          customerId: req.user.id,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.user.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      const orderData = insertOrderSchema.parse({
        ...req.body,
        customerId: customer.id,
      });

      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Review routes
  app.post("/api/reviews", authenticateToken, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.user.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      const reviewData = insertReviewSchema.parse({
        ...req.body,
        customerId: customer.id,
      });

      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reviews/farmer/:farmerId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsForFarmer(req.params.farmerId);
      res.json(reviews);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reviews/crop/:cropId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsForCrop(req.params.cropId);
      res.json(reviews);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle different message types
        console.log('Received WebSocket message:', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
