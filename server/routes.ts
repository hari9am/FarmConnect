import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { WebSocketServer } from "ws";
import { randomInt } from "crypto";
import { 
  User, Farmer, Customer, Crop, Message, Order, Review, UpcomingCrop, DeliveryRequest, MarketPrice,
  IUser, IFarmer, ICustomer, ICrop, IMessage, IOrder, IReview, IUpcomingCrop, IDeliveryRequest, IMarketPrice,
  InsertUser, InsertFarmer, InsertCustomer, InsertCrop, InsertMessage, InsertOrder, InsertReview, InsertUpcomingCrop, InsertDeliveryRequest,
  insertCropSchema, insertDeliveryRequestSchema, insertUpcomingCropSchema, insertMessageSchema, insertOrderSchema, insertReviewSchema
} from "@shared/mongodb-schema";

// Ensure all models are imported to register with Mongoose
import { 
  User as UserModel, 
  Farmer as FarmerModel, 
  Customer as CustomerModel, 
  Crop as CropModel, 
  Message as MessageModel, 
  Order as OrderModel, 
  Review as ReviewModel, 
  UpcomingCrop as UpcomingCropModel, 
  DeliveryRequest as DeliveryRequestModel, 
  MarketPrice as MarketPriceModel 
} from "@shared/mongodb-schema";
import { IStorage, MongoDBStorage } from "./mongodb-storage";
import { storage } from "./db";

// Helper function to ensure storage is ready
async function getStorage(): Promise<IStorage> {
  // Wait for storage to be initialized (max 5 seconds)
  let attempts = 0;
  while (!storage && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  if (!storage) {
    throw new Error('Storage not initialized');
  }
  return storage;
}

// Cron job for daily price updates
import cron from 'node-cron';
import twilio from "twilio";
import Stripe from 'stripe';
import { z } from 'zod';

function normalizeCrop(crop: any) {
  if (!crop) return crop;
  const obj = typeof crop?.toObject === "function" ? crop.toObject() : crop;
  const id = obj?.originalId || obj?.id || (obj?._id ? String(obj._id) : undefined);
  const loc = obj?.location;
  const location = loc
    ? {
        ...loc,
        lat: loc?.lat !== undefined ? Number(loc.lat) : loc?.lat,
        lng: loc?.lng !== undefined ? Number(loc.lng) : loc?.lng,
      }
    : loc;
  return {
    ...obj,
    id,
    location,
  };
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set - payment functionality will be disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

import Razorpay from "razorpay";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummyKey123456",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret_7890"
});
const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";

// Initialize Twilio client
const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as any;
    req.user = user;
    next();
  } catch {
    return res.sendStatus(403);
  }
};

export async function registerRoutes(app: express.Application): Promise<ReturnType<typeof createServer>> {
  // Use shared storage instance from db.ts
  // The storage is initialized asynchronously in db.ts
  
  // In-memory OTP store: phone -> { code, expiresAt }
  const otpStore = new Map<string, { code: string; expiresAt: number }>();

  // Debug middleware to log all requests
  app.use((req, res, next) => {
    if (req.path.includes('/api/crop')) {
      console.log(`${req.method} ${req.path} - Headers:`, req.headers.authorization ? 'Has Auth' : 'No Auth');
    }
    next();
  });

  // Test API endpoint for users
  app.get("/api/users", async (req, res) => {
    try {
      const storageInstance = await getStorage();
      const users = await storageInstance.getUser(req.query.id as string);
      if (!users) {
        // If no specific ID, return a simple test response
        return res.json({ 
          message: "Users API endpoint working",
          database: "MongoDB",
          status: "connected",
          timestamp: new Date().toISOString()
        });
      }
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Authentication routes - OTP only
  // Send OTP for login/registration
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const body = req.body as { phone: string; role?: string; isLogin?: boolean };
      const phone = String(body?.phone || "").replace(/\D/g, "");
      const role = body?.role;
      const isLogin = body?.isLogin === true;
      
      if (!phone) return res.status(400).json({ message: "Phone is required" });

      // Check if user exists
      const storageInstance = await getStorage();
      let user = await storageInstance.getUserByPhone(phone);
      
      // If this is a login attempt, check if user exists and role matches
      if (isLogin) {
        if (!user) {
          console.log(`[OTP] Login attempt for unregistered phone: ${phone}`);
          return res.status(404).json({ message: "Phone number not registered. Please register first." });
        }
        
        // Validate that the user's role matches the requested role
        if (role && user.role !== role) {
          console.log(`[OTP] Role mismatch during login. Phone: ${phone}, User role: ${user.role}, Requested role: ${role}`);
          return res.status(404).json({ message: `No ${role} account found with this phone number. Please use the correct login type.` });
        }
      }
      
      // If this is a registration attempt and user already exists with different role, handle role conflict
      if (!isLogin && user && role && user.role !== role) {
        console.log(`[OTP] Registration attempt for existing user with different role. Phone: ${phone}, Existing role: ${user.role}, Requested role: ${role}`);
        // We'll allow this but will handle role update during verification
      }

      if (!user) {
        // For new users, we'll create them after OTP verification
        console.log(`[OTP] New user phone: ${phone}`);
      } else {
        console.log(`[OTP] Existing user phone: ${phone}, role: ${user.role}`);
      }

      const code = String(randomInt(100000, 1000000));
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
      otpStore.set(phone, { code, expiresAt });
      console.log(`[OTP] Phone ${phone} -> ${code}`);

      // Send OTP via Twilio if configured
      if (twilioClient && process.env.TWILIO_SERVICE_ID) {
        try {
          await twilioClient.verify.v2
            .services(process.env.TWILIO_SERVICE_ID)
            .verifications.create({
              to: `+91${phone}`,
              channel: "sms",
            });
          console.log(`[Twilio] OTP sent successfully to ${phone}`);
        } catch (twilioError: any) {
          console.error(`[Twilio] Failed to send OTP: ${twilioError.message}`);
          // Continue with local OTP fallback
        }
      } else {
        console.log(`[OTP] Twilio not configured - using local OTP only`);
        // If you integrate an SMS provider, send a message that matches the Web OTP format below
        // so browsers supporting the Web OTP API can auto-read and fill the code.
        // Example SMS (replace domain):
        // "${code} is your FarmConnect verification code\n@farmconnect.dev # ${code}"
      }

      return res.json({ success: true, isNewUser: !user });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // Get single delivery request (owner only)
  app.get("/api/delivery-requests/:id", authenticateToken, async (req, res) => {
    try {
      const dr = await storage.getDeliveryRequest(req.params.id);
      if (!dr) return res.status(404).json({ message: "Delivery request not found" });
      const farmer = await storage.getFarmerByUserId(req.user.id);
      const customer = await storage.getCustomerByUserId(req.user.id);
      if ((farmer && dr.farmerId === farmer.id) || (customer && dr.customerId === customer.id)) {
        return res.json(dr);
      }
      return res.status(403).json({ message: "Not authorized" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delivery Requests: customer requests delivery; farmer sets price; customer pays or cancels
  app.post("/api/delivery-requests", authenticateToken, async (req, res) => {
    try {
      // Customer initiates for a specific crop + quantity
      const customer = await storage.getCustomerByUserId(req.user.id);
      if (!customer) return res.status(404).json({ message: "Customer profile not found" });
      const { cropId, quantity } = req.body as { cropId: string; quantity: number };
      if (!cropId || !quantity || quantity <= 0) return res.status(400).json({ message: "cropId and valid quantity are required" });
      const crop = await storage.getCrop(cropId);
      if (!crop) return res.status(404).json({ message: "Crop not found" });
      const data = insertDeliveryRequestSchema.parse({
        customerId: customer.id,
        farmerId: (crop as any).farmerId,
        cropId,
        quantity,
        status: "requested",
      } as any);
      const created = await storage.createDeliveryRequest(data);
      res.json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Farmer lists all delivery requests
  app.get("/api/farmer/delivery-requests", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) return res.status(404).json({ message: "Farmer profile not found" });
      const list = await storage.getDeliveryRequestsByFarmerId(farmer.id);
      res.json(list);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customer lists their delivery requests (priced or requested)
  app.get("/api/customer/delivery-requests", authenticateToken, async (req, res) => {
    try {
      const customer = await storage.getCustomerByUserId(req.user.id);
      if (!customer) return res.status(404).json({ message: "Customer profile not found" });
      const list = await storage.getDeliveryRequestsByCustomerId(customer.id);
      res.json(list);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Farmer sets a price for a request
  app.patch("/api/delivery-requests/:id/price", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) return res.status(404).json({ message: "Farmer profile not found" });
      const reqId = req.params.id;
      const bodyPrice = Number(req.body?.proposedDeliveryPrice);
      if (!isFinite(bodyPrice) || bodyPrice < 0) return res.status(400).json({ message: "Invalid price" });
      const dr = await storage.getDeliveryRequest(reqId);
      if (!dr) return res.status(404).json({ message: "Delivery request not found" });
      if ((dr as any).farmerId !== farmer.id) return res.status(403).json({ message: "Not authorized" });
      const updated = await storage.updateDeliveryRequest(reqId, { proposedDeliveryPrice: String(bodyPrice), status: "priced" } as any);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customer accepts a priced request
  app.patch("/api/delivery-requests/:id/accept", authenticateToken, async (req, res) => {
    try {
      const customer = await storage.getCustomerByUserId(req.user.id);
      if (!customer) return res.status(404).json({ message: "Customer profile not found" });
      const dr = await storage.getDeliveryRequest(req.params.id);
      if (!dr) return res.status(404).json({ message: "Delivery request not found" });
      if ((dr as any).customerId !== customer.id) return res.status(403).json({ message: "Not authorized" });
      if (!dr.proposedDeliveryPrice) return res.status(400).json({ message: "Price not set by farmer yet" });
      const updated = await storage.updateDeliveryRequest(req.params.id, { status: "accepted" } as any);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customer cancels a request
  app.patch("/api/delivery-requests/:id/cancel", authenticateToken, async (req, res) => {
    try {
      const customer = await storage.getCustomerByUserId(req.user.id);
      if (!customer) return res.status(404).json({ message: "Customer profile not found" });
      const dr = await storage.getDeliveryRequest(req.params.id);
      if (!dr) return res.status(404).json({ message: "Delivery request not found" });
      if ((dr as any).customerId !== customer.id) return res.status(403).json({ message: "Not authorized" });
      const updated = await storage.updateDeliveryRequest(req.params.id, { status: "cancelled" } as any);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update a crop (farmer-owned)
  app.patch("/api/crops/:id", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) return res.status(404).json({ message: "Farmer profile not found" });

      const crop = await storage.getCrop(req.params.id);
      if (!crop) return res.status(404).json({ message: "Crop not found" });
      if ((crop as any).farmerId !== farmer.id) return res.status(403).json({ message: "Not authorized to edit this crop" });

      const updates: any = {};
      const allowed = ["name","category","quantity","unit","pricePerUnit","expiryDate","images","isActive","location"];
      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
          updates[key] = key === "expiryDate" && req.body[key] ? new Date(req.body[key]) : req.body[key];
        }
      }
      if (Object.keys(updates).length === 0) return res.status(400).json({ message: "No valid fields to update" });

      // Coerce decimal to string if present (drizzle decimal)
      if (updates.pricePerUnit !== undefined) updates.pricePerUnit = String(updates.pricePerUnit);

      const updated = await storage.updateCrop(req.params.id, updates);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Public: Karnataka fruits prices (vegetablemarketprice.com)
  const fruitsCacheKey = "__fruitsKarnatakaCache";
  app.get("/api/market/fruits", async (req, res) => {
    try {
      const now = Date.now();
      const ttlMs = 6 * 60 * 60 * 1000; // cache 6 hours for fruits
      const noCache = String((req.query?.nocache ?? "")).toLowerCase() === "1";
      const existing = (global as any)[fruitsCacheKey] as { items: Array<{ name: string; price: number; unit: string }>; lastUpdated: number } | undefined;
      if (!noCache && existing && now - existing.lastUpdated < ttlMs) {
        return res.json({
          lastUpdated: new Date(existing.lastUpdated).toISOString(),
          unit: "kg",
          items: existing.items,
          source: "vegetablemarketprice.com",
          ttlSeconds: Math.floor((ttlMs - (now - existing.lastUpdated)) / 1000),
          cached: true,
        });
      }

      const url = "https://rates.goldenchennai.com/fruit-price/bangalore-fruit-price-today/";
      let items: Array<{ name: string; price: number; unit: string }> | null = null;
      try {
        const response = await fetch(url, {
          headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "accept-language": "en-IN,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "referer": "https://rates.goldenchennai.com/",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "upgrade-insecure-requests": "1",
          } as any,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();

        // GoldenChennai typically shows a table of "Fruit" and "Price per Kg"
        const lines = html
          .split(/\n|<tr|<td|<li|<p|<div/gi)
          .map((s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "))
          .map((s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim())
          .filter(Boolean);
        const results: Array<{ name: string; price: number; unit: string }> = [];
        const seen = new Set<string>();
        const blacklist = /(bangalore|bengaluru|today|fruit price|golden chennai|goldenchennai|updated|terms|privacy|copyright|table|header|footer)/i;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (blacklist.test(line)) continue;
          // Try to extract pairs: name then price on same or next line
          const m = line.match(/([A-Za-z][A-Za-z\s\-]{2,40})[^0-9₹Rs]{0,40}(?:₹|Rs\.?)[^0-9]{0,5}(\d{1,3}(?:\.\d{1,2})?)/i)
            || (i + 1 < lines.length ? `${line} ${lines[i+1]}`.match(/([A-Za-z][A-Za-z\s\-]{2,40})[^0-9₹Rs]{0,40}(?:₹|Rs\.?)[^0-9]{0,5}(\d{1,3}(?:\.\d{1,2})?)/i) : null);
          if (m) {
            const rawName = m[1].trim().replace(/\s+/g, " ");
            if (rawName.length > 2 && rawName.length < 40 && !blacklist.test(rawName)) {
              const price = Number(m[2]);
              if (!Number.isNaN(price) && price >= 5 && price <= 500 && !seen.has(rawName.toLowerCase())) {
                results.push({ name: rawName, price, unit: "kg" });
                seen.add(rawName.toLowerCase());
              }
            }
          }
          if (results.length >= 40) break;
        }
        if (results.length > 0) items = results;
      } catch (e) {
        console.warn("[market fruits] fetch failed, using fallback:", (e as any)?.message);
      }

      if (!items || items.length === 0) {
        items = [
          { name: "Apple", price: 120, unit: "kg" },
          { name: "Banana", price: 40, unit: "kg" },
          { name: "Mango", price: 90, unit: "kg" },
          { name: "Orange", price: 70, unit: "kg" },
          { name: "Grapes", price: 80, unit: "kg" },
        ];
      }

      (global as any)[fruitsCacheKey] = { items, lastUpdated: now };
      return res.json({
        lastUpdated: new Date(now).toISOString(),
        unit: "kg",
        items,
        source: "rates.goldenchennai.com",
        ttlSeconds: Math.floor(ttlMs / 1000),
        cached: false,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error?.message || "Failed to load fruits prices" });
    }
  });

  // Public: Bengaluru specific egg price from todayeggrate.in (smart per-egg detection + cache)
  const blrCacheKey = "__blrEggPriceCache";
  app.get("/api/market/eggs/bengaluru", async (req, res) => {
    try {
      const now = Date.now();
      const ttlMs = 10 * 60 * 1000;
      const noCache = String((req.query?.nocache ?? "")).toLowerCase() === "1";
      const existing = (global as any)[blrCacheKey] as { price: number; lastUpdated: number } | undefined;
      if (!noCache && existing && now - existing.lastUpdated < ttlMs) {
        return res.json({ city: "Bengaluru", unit: "number", price: existing.price, lastUpdated: new Date(existing.lastUpdated).toISOString(), source: "todayeggrate.in", ttlSeconds: Math.floor((ttlMs - (now - existing.lastUpdated)) / 1000), cached: true });
      }

      const url = "https://todayeggrate.in/bengaluru-egg-rate/";
      const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 FarmConnect" } as any });
      const html = await response.text();

      // Strip scripts/styles and collapse whitespace
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Try to find a rupee price near the word Bengaluru/Bangalore or a heading like "Egg Rate Today"
      let price: number | null = null;
      const candidates: number[] = [];
      // Numbers like 5.15 or 515 or Rs 515
      const numMatches = text.match(/₹?\s*(\d{1,4}(?:\.\d{1,2})?)/g) || [];
      for (const m of numMatches) {
        const n = Number(String(m).replace(/[^0-9.]/g, ""));
        if (!Number.isNaN(n)) candidates.push(n);
      }
      // Heuristic: pick first reasonable number; convert if it's likely per 100 eggs
      for (const n of candidates) {
        if (n > 0) {
          if (n >= 50) {
            price = n / 100; // assume per 100 eggs
          } else {
            price = n; // assume per egg
          }
          break;
        }
      }

      if (price == null) {
        return res.status(502).json({ message: "Unable to parse Bengaluru egg price" });
      }

      (global as any)[blrCacheKey] = { price, lastUpdated: now };
      return res.json({ city: "Bengaluru", unit: "number", price, lastUpdated: new Date(now).toISOString(), source: "todayeggrate.in", ttlSeconds: Math.floor(ttlMs / 1000), cached: false });
    } catch (error: any) {
      return res.status(500).json({ message: error?.message || "Failed to load Bengaluru egg price" });
    }
  });

  // Verify OTP and login/register
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const body = req.body as { phone: string; otp: string; userData?: any };
      const phone = String(body?.phone || "").replace(/\D/g, "");
      const otp = String(body?.otp || "").replace(/\D/g, "").trim();
      const userData = body?.userData;
      if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required" });

      // TEMPORARY: Allow any 6-digit OTP for testing
      console.log(`[Auth] OTP verification attempt - phone: ${phone}, otp: ${otp}`);
      
      if (otp.length !== 6) {
        return res.status(400).json({ message: "OTP must be 6 digits" });
      }

      // Skip actual OTP verification for testing
      console.log(`[Auth] OTP accepted (testing mode)`);

      let user = await storage.getUserByPhone(phone);
      
      // If user doesn't exist and userData is provided, create new user
      if (!user && userData) {
        const newUser = await storage.createUser({
          username: userData.username,
          phone: userData.phone,
          role: userData.role,
          language: userData.language || 'en',
          password: '', // No password for OTP-only auth
          isVerified: false,
          phoneVerified: true, // Mark phone as verified after successful OTP
        });

        // Create role-specific profile
        if (userData.role === 'farmer') {
          await storage.createFarmer({
            userId: newUser.id,
            kissanNumber: userData.kissanNumber || undefined,
            bankAccountNumber: undefined, // Bank details no longer required
            ifscCode: undefined, // Bank details no longer required
            upiId: undefined, // UPI details no longer required
            rating: 0,
            totalReviews: 0
          });
        } else {
          await storage.createCustomer({
            userId: newUser.id,
          });
        }

        user = newUser;
      } else if (!user) {
        return res.status(400).json({ message: "User not found. Please register first." });
      } else if (userData) {
        // For existing users, validate that the requested role matches their current role
        if (userData.role && userData.role !== user.role) {
          console.log(`[Auth] Role mismatch during verification. Phone: ${phone}, User role: ${user.role}, Requested role: ${userData.role}`);
          return res.status(400).json({ message: `Account role mismatch. This phone number is registered as a ${user.role}. Please use the correct login type.` });
        }
        
        // Update other user data if provided (but not role)
        const updateData: any = { phoneVerified: true };
        if (userData.username && userData.username !== user.username) {
          updateData.username = userData.username;
        }
        
        if (Object.keys(updateData).length > 1) { // Only update if there's more than just phoneVerified
          user = await storage.updateUser(user.id, updateData);
        } else {
          // Just update phone verification status
          await storage.updateUser(user.id, { phoneVerified: true });
        }
      } else {
        // Update existing user's phone verification status
        await storage.updateUser(user.id, { phoneVerified: true });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          role: user.role,
          language: user.language,
          phoneVerified: true,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // Delete entire account (farmer or customer) and all related data
  app.delete("/api/account", authenticateToken, async (req, res) => {
    try {
      await storage.deleteAccount(req.user.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete a crop (farmer-owned) – hard delete with cascading cleanup
  app.delete("/api/crops/:id", authenticateToken, async (req, res) => {
    try {
      console.log("[DELETE /api/crops] id=", req.params.id, " user=", req.user?.id);
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) return res.status(404).json({ message: "Farmer profile not found" });

      const crop = await storage.getCrop(req.params.id);
      if (!crop) return res.status(404).json({ message: "Crop not found" });
      if ((crop as any).farmerId !== farmer.id) return res.status(403).json({ message: "Not authorized to delete this crop" });

      // Hard delete: remove related orders and reviews, then the crop
      await storage.deleteCrop(req.params.id);
      console.log("[DELETE /api/crops] deleted id=", req.params.id);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("[DELETE /api/crops] error:", error);
      return res.status(400).json({ message: error.message });
    }
  });

  // Delete an upcoming crop (farmer-owned)
  app.delete("/api/upcoming/:id", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) return res.status(404).json({ message: "Farmer profile not found" });

      const item = await storage.getUpcomingCrop(req.params.id);
      if (!item) return res.status(404).json({ message: "Upcoming crop not found" });
      if (item.farmerId !== farmer.id) return res.status(403).json({ message: "Not authorized to delete this item" });

      await storage.deleteUpcomingCrop(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update an upcoming crop (farmer-owned)
  app.patch("/api/upcoming/:id", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) return res.status(404).json({ message: "Farmer profile not found" });

      const item = await storage.getUpcomingCrop(req.params.id);
      if (!item) return res.status(404).json({ message: "Upcoming crop not found" });
      if (item.farmerId !== farmer.id) return res.status(403).json({ message: "Not authorized to edit this item" });

      const updates: any = {
        name: req.body?.name,
        photoUrl: req.body?.photoUrl,
        yieldTime: req.body?.yieldTime,
        location: req.body?.location,
      };
      if (Object.prototype.hasOwnProperty.call(req.body || {}, 'plantedDate')) {
        updates.plantedDate = req.body.plantedDate ? new Date(req.body.plantedDate) : null;
      }

      const updated = await storage.updateUpcomingCrop(req.params.id, updates);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Public: Get all upcoming crops (for customers)
  app.get("/api/public/upcoming", async (_req, res) => {
    try {
      const list = await storage.getAllUpcoming();
      res.json(list);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Public: Get upcoming crop by ID
  app.get("/api/public/upcoming/:id", async (req, res) => {
    try {
      const item = await storage.getUpcomingCrop(req.params.id);
      if (!item) return res.status(404).json({ message: "Upcoming crop not found" });
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Public: Daily egg market prices (scraped from external source with fallback)
  const eggPriceCache: { items: Array<{ name: string; price: number; unit: string }>; lastUpdated: number } | null = (global as any).__eggPriceCache || null;
  let _eggCache: typeof eggPriceCache = eggPriceCache;
  app.get("/api/market/eggs", async (req, res) => {
    try {
      const now = Date.now();
      const ttlMs = 10 * 60 * 1000; // 10 minutes
      const noCache = String((req.query?.nocache ?? "")).toLowerCase() === "1";
      if (!noCache && _eggCache && now - _eggCache.lastUpdated < ttlMs) {
        return res.json({
          lastUpdated: new Date(_eggCache.lastUpdated).toISOString(),
          unit: "number",
          items: _eggCache.items,
          source: "e2necc.com",
          ttlSeconds: Math.floor((ttlMs - (now - _eggCache.lastUpdated)) / 1000),
          cached: true,
        });
      }

      const url = "https://www.commodityonline.com/egg-rate/karnataka";
      let items: Array<{ name: string; price: number; unit: string }> | null = null;
      try {
        const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 FarmConnect" } as any });
        const html = await response.text();

        // Strategy 1: Look for JSON embedded in the page (unlikely on commodityonline, but safe to try)
        const jsonMatch = html.match(/\[\s*{[\s\S]*?\"?centre\"?[\s\S]*?}\s*\]/i);
        if (jsonMatch) {
          try {
            const jsonStart = html.indexOf("[");
            const jsonEnd = html.lastIndexOf("]");
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              const jsonText = html.slice(jsonStart, jsonEnd + 1);
              const parsed = JSON.parse(jsonText);
              if (Array.isArray(parsed)) {
                const results = parsed
                  .map((row: any) => {
                    const name = String(row.centre || row.center || row.city || row.location || "").trim();
                    const perHundred = Number(String(row.egg_rate || row.rate || row.price || "").replace(/[^0-9.]/g, ""));
                    const perEgg = perHundred / 100; // e2necc provides rate per 100 eggs
                    return name && !Number.isNaN(perEgg) ? { name, price: perEgg, unit: "number" } : null;
                  })
                  .filter(Boolean) as Array<{ name: string; price: number; unit: string }>;
                if (results.length > 0) items = results;
              }
            }
          } catch {}
        }

        // Strategy 2: Parse table rows by scanning text lines
        if (!items || items.length === 0) {
          const lines = html
            .split(/\n|<li|<tr|<td|<p|<div/gi)
            .map((s) => s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "))
            .map((s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim())
            .filter(Boolean);
          const results: Array<{ name: string; price: number; unit: string }> = [];
          const seen = new Set<string>();
          const karnatakaCities = [
            "Bengaluru","Bangalore","Mangaluru","Mangalore","Mysuru","Mysore","Hubballi","Hubli",
            "Belagavi","Belgaum","Tumakuru","Tumkur","Shivamogga","Shimoga","Ballari","Bellary",
            "Davanagere","Udupi","Hassan","Bidar","Kalaburagi","Gulbarga","Raichur","Vijayapura","Bijapur",
            "Bagalkot","Chitradurga","Kolar","Chikkamagaluru","Chikmagalur","Ramanagara","Mandya","Haveri",
            "Dharwad","Koppal","Gadag","Yadgir","Kodagu","Coorg","Chamarajanagar","Sirsi"
          ];
          const cityAlt = karnatakaCities.map(c => c.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|");
          // Require a currency marker (₹ or Rs) near the number to avoid layout numbers like widths/heights
          const cityRegexStrict = new RegExp(`\\b(${cityAlt})\\b[^₹Rs0-9]{0,40}(?:₹|Rs\\.?)[^0-9]{0,5}(\\d{2,4}(?:\\.\\d{1,2})?)`, "i");
          const cityRegexLoose = new RegExp(`\\b(${cityAlt})\\b[^0-9]{0,30}(\\d{2,4}(?:\\.\\d{1,2})?)`, "i");
          for (const line of lines) {
            let m = line.match(cityRegexStrict);
            if (!m) m = line.match(cityRegexLoose);
            if (m) {
              const city = m[1].trim();
              const raw = Number(m[2]);
              // Prefer values in 200-900 range as per-100; smaller numbers likely per-egg already
              const perEgg = raw >= 200 ? raw / 100 : raw >= 2 && raw <= 10 ? raw : raw / 100;
              // Accept only reasonable per-egg range to avoid garbage (₹3 to ₹9)
              if (!Number.isNaN(perEgg) && perEgg >= 3 && perEgg <= 9 && !seen.has(city.toLowerCase())) {
                results.push({ name: city, price: Number(perEgg.toFixed(2)), unit: "number" });
                seen.add(city.toLowerCase());
              }
            }
            if (results.length >= 50) break;
          }
          if (results.length > 0) items = results;
        }
      } catch (e) {
        console.warn("[market eggs] fetch failed, using fallback:", (e as any)?.message);
      }

      if (!items || items.length === 0) {
        const base = 5.0; // nominal per-egg INR price
        const jitter = () => Number((Math.random() * 0.4 - 0.2).toFixed(2));
        items = [
          { name: "Delhi", price: base + jitter(), unit: "number" },
          { name: "Mumbai", price: base + jitter(), unit: "number" },
          { name: "Chennai", price: base + jitter(), unit: "number" },
          { name: "Kolkata", price: base + jitter(), unit: "number" },
          { name: "Bengaluru", price: base + jitter(), unit: "number" },
          { name: "Hyderabad", price: base + jitter(), unit: "number" },
        ];
      }

      _eggCache = { items, lastUpdated: now };
      (global as any).__eggPriceCache = _eggCache;

      res.json({
        lastUpdated: new Date(now).toISOString(),
        unit: "number",
        items,
        source: "commodityonline.com",
        ttlSeconds: Math.floor((Date.now() - now + 10 * 60 * 1000) / 1000),
        cached: false,
        basis: "per100",
      });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to load egg prices" });
    }
  });

  // Upcoming crops routes
  app.post("/api/upcoming", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) return res.status(404).json({ message: "Farmer profile not found" });

      const body = {
        ...req.body,
        farmerId: farmer.id,
        plantedDate: req.body?.plantedDate ? new Date(req.body.plantedDate) : undefined,
        yieldTime: req.body?.yieldTime || undefined,
        location: req.body?.location || undefined,
      };

      const data = insertUpcomingCropSchema.parse(body);
      const created = await storage.createUpcomingCrop(data);
      res.json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/upcoming", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) return res.status(404).json({ message: "Farmer profile not found" });
      const list = await storage.getUpcomingCropsByFarmerId(farmer.id);
      res.json(list);
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

  // User profile routes
  app.patch("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const { username, phone, profilePhoto } = req.body;
      const updatedUser = await storage.updateUserProfile(req.user.id, { username, phone, profilePhoto });
      res.json({ user: updatedUser });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customer routes
  app.get("/api/customer/profile", authenticateToken, async (req, res) => {
    try {
      const customer = await storage.getCustomerByUserId(req.user.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Farmer routes
  app.get("/api/farmer/profile", authenticateToken, async (req, res) => {
    try {
      console.log("Fetching farmer profile for user ID:", req.user.id);
      const farmer = await storage.getFarmerByUserId(req.user.id);
      console.log("Farmer profile found:", farmer);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }
      res.json(farmer);
    } catch (error: any) {
      console.error("Error fetching farmer profile:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get farmer by id (returns farmer record including userId)
  app.get("/api/farmers/:id", async (req: express.Request, res: express.Response) => {
    try {
      const farmer = await storage.getFarmer(req.params.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
      res.json(farmer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/farmer/payment-details", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }

      const updatedFarmer = await storage.updateFarmerProfile(farmer.id, req.body);
      res.json(updatedFarmer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/farmer/profile", authenticateToken, async (req, res) => {
    try {
      const { username, phone, profilePhoto, bankAccountNumber, ifscCode, upiId } = req.body;
      console.log("Updating farmer profile with data:", { username, phone, profilePhoto, bankAccountNumber, ifscCode, upiId });
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(req.user.id, { username, phone, profilePhoto });
      
      // Update farmer profile
      const updatedFarmer = await storage.updateFarmerProfile(req.user.id, {
        bankAccountNumber,
        ifscCode,
        upiId,
      });
      console.log("Updated farmer profile:", updatedFarmer);

      res.json({ user: updatedUser, farmer: updatedFarmer });
    } catch (error: any) {
      console.error("Error updating farmer profile:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Crop routes
  app.get("/api/crops", async (req, res) => {
    try {
      // For now, return all active crops regardless of location
      // TODO: Implement location-based filtering in MongoDB storage
      const crops = await storage.getActiveCrops();
      res.json((crops || []).map((c: any) => normalizeCrop(c)));
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
      res.json(normalizeCrop(crop));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/farmer/crops", authenticateToken, async (req, res) => {
    try {
      const farmer = await storage.getFarmerByUserId(req.user.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }

      const crops = await storage.getCropsByFarmerId(farmer.id);
      res.json((crops || []).map((c: any) => normalizeCrop(c)));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Test route to debug
  app.post("/api/crop", (req, res) => {
    console.log("Received POST to /api/crop (singular) - this should not be called");
    res.status(400).json({ message: "Wrong endpoint - use /api/crops (plural)" });
  });

  app.post("/api/crops", authenticateToken, async (req, res) => {
    try {
      console.log("POST /api/crops - User ID:", req.user.id);
      console.log("User object from JWT:", req.user);
      
      // Let's also check if the user exists
      const user = await storage.getUser(req.user.id);
      console.log("User found:", user ? "Yes" : "No", user?.id);
      
      const farmer = await storage.getFarmerByUserId(req.user.id);
      console.log("Farmer found:", farmer ? "Yes" : "No", farmer?.id);
      if (!farmer) {
        console.log("No farmer profile found for user ID:", req.user.id);
        return res.status(404).json({ message: "Farmer profile not found" });
      }

      console.log("Raw request body:", JSON.stringify(req.body, null, 2));
      
      // Check required fields
      const requiredFields = ['name', 'quantity', 'pricePerUnit'];
      for (const field of requiredFields) {
        if (!req.body[field] && req.body[field] !== 0) {
          console.log(`Missing required field: ${field}`);
          return res.status(400).json({ message: `Missing required field: ${field}` });
        }
      }
      
      // Coerce incoming JSON types to match schema (decimal -> string, timestamp -> Date)
      const coercedBody = {
        ...req.body,
        quantity: req.body?.quantity !== undefined ? Number(req.body.quantity) : undefined,
        pricePerUnit: req.body?.pricePerUnit !== undefined ? Number(req.body.pricePerUnit) : undefined,
        expiryDate: req.body?.expiryDate ? new Date(req.body.expiryDate) : undefined,
        unit: req.body?.unit || 'kg', // Default unit
      };
      
      console.log("Coerced body:", JSON.stringify(coercedBody, null, 2));

      const cropData = insertCropSchema.parse({
        ...coercedBody,
        farmerId: farmer.id,
      });

      console.log("Parsed crop data:", JSON.stringify(cropData, null, 2));
      const crop = await storage.createCrop(cropData);
      res.json(crop);
    } catch (error: any) {
      console.error("Error creating crop:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Message routes
  app.get("/api/conversations", authenticateToken, async (req, res) => {
    try {
      console.log(`[API] Getting conversations for user: ${req.user.id}`);
      const conversations = await storage.getConversations(req.user.id);
      console.log(`[API] Found ${conversations.length} conversations`);
      res.json(conversations);
    } catch (error: any) {
      console.error("[API] Error getting conversations:", error);
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
      // Mark counterpart's unread count can be derived; optionally mark as read for sender
      try {
        await storage.markMessagesRead(req.user.id, req.body.receiverId);
      } catch {}
      
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

  // Payment routes (Razorpay Checkout Order Creation)
  app.post("/api/payments/checkout-session", authenticateToken, async (req, res) => {
    try {
      const { amount, cropId, quantity, successPath, cancelPath } = req.body as {
        amount: number;
        cropId: string;
        quantity?: number;
        successPath?: string;
        cancelPath?: string;
      };

      if (!amount || !isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      if (!cropId) {
        return res.status(400).json({ message: "Missing cropId" });
      }

      // Create Razorpay Order
      let rzpOrder;
      const isDummyKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes("dummy");
      
      if (isDummyKey) {
        rzpOrder = {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(Number(amount) * 100),
          currency: "INR"
        };
      } else {
        rzpOrder = await razorpay.orders.create({
          amount: Math.round(Number(amount) * 100), // amount in paise
          currency: "INR",
          receipt: `receipt_order_crop_${cropId}`,
          payment_capture: true,
        });
      }

      res.json({
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_dummyKey123456", // sending key to frontend
      });
    } catch (error: any) {
      console.error("[Razorpay Error]", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Razorpay removed – no endpoints

  // Create internal order (used by UPI/COD flows and as a fallback)
  app.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      const customer = await storage.getCustomerByUserId((req as any).user.id);
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
      const customer = await storage.getCustomerByUserId(req.user.id);
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
      const reviews = await storage.getReviewsByFarmerId(req.params.farmerId);
      res.json(reviews);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reviews/crop/:cropId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByCropId(req.params.cropId);
      res.json(reviews);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // Live Market Prices API
  app.get("/api/market-prices", async (req, res) => {
    try {
      const { state = "Karnataka", district = "Bengaluru", category = "Vegetables" } = req.query;
      
      // Fetch from AGMARKNET API
      const agmarknetResponse = await fetch(
        `https://agmarknet.gov.in/api/commodity?state=${encodeURIComponent(state as string)}&district=${encodeURIComponent(district as string)}&format=json`
      );
      
      if (!agmarknetResponse.ok) {
        throw new Error(`AGMARKNET API error: ${agmarknetResponse.status}`);
      }
      
      const agmarknetData = await agmarknetResponse.json();
      
      // Transform AGMARKNET data to our format
      const prices = agmarknetData.records?.map((record: any) => ({
        commodity: record.commodity || "Unknown",
        category: "Vegetable",
        price: parseFloat(record.modal_price) || 0,
        unit: "kg",
        market: record.market || "Local Market",
        state: record.state || state,
        district: record.district || district,
        date: record.arrival_date || new Date().toISOString().split('T')[0],
        minPrice: parseFloat(record.min_price) || 0,
        maxPrice: parseFloat(record.max_price) || 0,
        yesterdayPrice: parseFloat(record.modal_price) || 0, // Will be calculated
        trend: "Stable" // Will be calculated
      })) || [];

      // Also store in database for historical data
      if (prices.length > 0) {
        try {
          // Store in database (you'll need to create PriceModel)
          console.log(`[Market Prices] Storing ${prices.length} price records`);
        } catch (dbError) {
          console.error(`[Market Prices] Database error:`, dbError);
        }
      }

      res.json(prices);
    } catch (error: any) {
      console.error('[Market Prices] Error:', error);
      res.status(500).json({ message: error.message || "Failed to fetch market prices" });
    }
  });

  // Historical prices for trend calculation
  app.get("/api/market-prices/history", async (req, res) => {
    try {
      const { commodity, days = 7 } = req.query;
      
      // This would query your database for historical prices
      // For now, return mock data
      const mockHistoricalPrices = Array.from({ length: parseInt(days as string) }, (_, i) => ({
        date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        price: Math.random() * 50 + 20, // Mock price between 20-70
        commodity: commodity as string
      }));

      res.json(mockHistoricalPrices);
    } catch (error: any) {
      console.error('[Market Prices History] Error:', error);
      res.status(500).json({ message: error.message || "Failed to fetch historical prices" });
    }
  });

  // Daily price update cron job - runs every day at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Starting daily market price update...');
    
    try {
      // Fetch prices for major vegetables from AGMARKNET
      const states = ['Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Punjab'];
      const districts = ['Bengaluru', 'Mumbai', 'Delhi', 'Chandigarh'];
      
      for (const state of states) {
        for (const district of districts) {
          try {
            console.log(`[Cron] Fetching prices for ${state} - ${district}`);
            
            const agmarknetResponse = await fetch(
              `https://agmarknet.gov.in/api/commodity?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&format=json`
            );
            
            if (agmarknetResponse.ok) {
              const agmarknetData = await agmarknetResponse.json();
              
              if (agmarknetData.records && agmarknetData.records.length > 0) {
                const records = agmarknetData.records.map((record: any) => ({
                  commodity: record.commodity || 'Unknown',
                  category: 'Vegetable',
                  price: parseFloat(record.modal_price) || 0,
                  unit: 'kg',
                  market: record.market || 'Local Market',
                  state: record.state || state,
                  district: record.district || district,
                  date: record.arrival_date || new Date().toISOString().split('T')[0],
                  minPrice: parseFloat(record.min_price) || 0,
                  maxPrice: parseFloat(record.max_price) || 0,
                  yesterdayPrice: parseFloat(record.modal_price) || 0, // Will be calculated
                  trend: 'Stable' // Will be calculated
                }));
                
                // Store in database
                for (const priceData of records) {
                  try {
                    await storage.createMarketPrice(priceData);
                    console.log(`[Cron] Stored price for ${priceData.commodity}: ${priceData.price}`);
                  } catch (dbError) {
                    console.error(`[Cron] Database error storing price for ${priceData.commodity}:`, dbError);
                  }
                }
              }
            }
          } catch (error) {
            console.error(`[Cron] Error fetching prices for ${state} - ${district}:`, error);
          }
        }
      }
      
      console.log('[Cron] Daily market price update completed');
    } catch (error) {
      console.error('[Cron] Error in daily price update:', error);
    }
  });

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
