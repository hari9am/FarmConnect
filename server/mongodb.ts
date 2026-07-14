import 'dotenv/config';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';

// MongoDB connection
let isConnected = false;

// Function to get DATABASE_URL from .env file directly
function getDatabaseUrl() {
  // Prefer already-loaded env var (cross-env / dotenv/config)
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        // Handle the case where the value might contain = characters
        const value = line.substring('DATABASE_URL='.length).trim();
        return value;
      }
    }
  } catch (error) {
    console.warn('Could not read .env file:', error);
  }
  
  // No DATABASE_URL found
  return undefined;
}

export async function connectToMongoDB() {
  if (isConnected) {
    console.log("Already connected to MongoDB");
    return mongoose.connection;
  }

  const databaseUrl = getDatabaseUrl();
  
  if (!databaseUrl) {
    console.warn("DATABASE_URL not set, using mock storage");
    return null;
  }

  console.log("DATABASE_URL:", databaseUrl.replace(/\/\/.*@/, '//***:***@'));

  try {
    await mongoose.connect(databaseUrl, {
      serverSelectionTimeoutMS: 30000, // Increased timeout to 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain a minimum of 2 socket connections
      retryWrites: true,
      connectTimeoutMS: 30000, // Connection timeout
      bufferCommands: false, // Disable mongoose buffering
    });
    isConnected = true;
    console.log("✅ Connected to live MongoDB Atlas successfully");
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    return mongoose.connection;
  } catch (error) {
    console.error("❌ Failed to connect to live MongoDB Atlas:", error);
    console.log("🔄 Attempting to connect to local MongoDB as fallback...");
    
    // Try local MongoDB as fallback
    const localUrl = "mongodb://localhost:27017/farmconnect";
    try {
      await mongoose.connect(localUrl, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        connectTimeoutMS: 30000,
        bufferCommands: false,
      });
      isConnected = true;
      console.log("✅ Connected to local MongoDB successfully (fallback)");
      return mongoose.connection;
    } catch (localError) {
      console.error("❌ Failed to connect to local MongoDB:", localError);
      console.log("🚫 Both live and local MongoDB connections failed");
      isConnected = false;
      return null;
    }
  }
}

export async function disconnectFromMongoDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("Disconnected from MongoDB");
  }
}

export { mongoose };
