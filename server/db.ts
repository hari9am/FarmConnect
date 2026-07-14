import 'dotenv/config';
import { connectToMongoDB } from './mongodb';
import { MongoDBStorage } from './mongodb-storage';
import { MockStorage } from './mock-storage';
// Import all models to ensure they're registered with Mongoose
import { 
  User, Farmer, Customer, Crop, Message, Order, Review, UpcomingCrop, DeliveryRequest, MarketPrice 
} from '@shared/mongodb-schema';

// Initialize MongoDB connection and storage
let db: any = null;
let storage: any = null;

async function initializeDatabase() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL?.replace(/\/\/.*:.*@/, "//***:***@"));

  try {
    db = await connectToMongoDB();
    if (!db) {
      console.warn("⚠️ MongoDB connection failed, using mock storage");
      storage = new MockStorage();
      return;
    }

    storage = new MongoDBStorage();
    console.log("✅ MongoDB connection and storage initialized successfully");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    console.warn("⚠️ Using mock storage for testing");
    storage = new MockStorage();
  }
}

// Initialize database connection
initializeDatabase();

export { db, storage };