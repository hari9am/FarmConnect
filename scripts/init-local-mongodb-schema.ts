import mongoose from "mongoose";

// Importing these models registers all schemas with mongoose
import {
  User,
  Farmer,
  Customer,
  Crop,
  Message,
  Order,
  Review,
  UpcomingCrop,
  DeliveryRequest,
} from "../shared/mongodb-schema";

async function initLocalMongoSchema() {
  const uri = "mongodb://localhost:27017/farmconnect";

  console.log("🔧 Initializing MongoDB schema (collections + indexes)");
  console.log("URI:", uri.replace(/\/\/.*@/, "//***:***@"));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
    retryWrites: true,
    connectTimeoutMS: 30000,
  });

  try {
    // Creating indexes also ensures collections exist
    await Promise.all([
      User.createIndexes(),
      Farmer.createIndexes(),
      Customer.createIndexes(),
      Crop.createIndexes(),
      Message.createIndexes(),
      Order.createIndexes(),
      Review.createIndexes(),
      UpcomingCrop.createIndexes(),
      DeliveryRequest.createIndexes(),
    ]);

    console.log("✅ Collections ready and indexes ensured");
    console.log("Database:", mongoose.connection.db?.databaseName);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

initLocalMongoSchema().catch((err) => {
  console.error("❌ Failed to initialize schema:", err);
  process.exitCode = 1;
});
