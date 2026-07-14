const mongoose = require('mongoose');
const { config } = require('dotenv');
const { join } = require('path');

// Load environment variables
const envPath = join(process.cwd(), '.env');
config({ path: envPath });

// Import schemas
const {
  userSchema,
  farmerSchema,
  customerSchema,
  cropSchema,
  messageSchema,
  orderSchema,
  deliveryRequestSchema,
  reviewSchema,
  upcomingCropSchema
} = require('../shared/mongodb-schema');

// Connect to MongoDB
async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';
  console.log('Connecting to MongoDB at:', uri.replace(/\/\/.*@/, '//***@'));
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Successfully connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    return false;
  }
}

// Create collections with validation
async function setupCollections() {
  try {
    const db = mongoose.connection.db;
    
    // Drop existing collections (for fresh setup)
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }
    
    // Create collections with validation
    await db.createCollection('users', {
      validator: {
        $jsonSchema: userSchema.obj
      }
    });
    
    await db.createCollection('farmers', {
      validator: {
        $jsonSchema: farmerSchema.obj
      }
    });
    
    await db.createCollection('customers', {
      validator: {
        $jsonSchema: customerSchema.obj
      }
    });
    
    await db.createCollection('crops', {
      validator: {
        $jsonSchema: cropSchema.obj
      }
    });
    
    await db.createCollection('messages', {
      validator: {
        $jsonSchema: messageSchema.obj
      }
    });
    
    await db.createCollection('orders', {
      validator: {
        $jsonSchema: orderSchema.obj
      }
    });
    
    await db.createCollection('deliveryrequests', {
      validator: {
        $jsonSchema: deliveryRequestSchema.obj
      }
    });
    
    await db.createCollection('reviews', {
      validator: {
        $jsonSchema: reviewSchema.obj
      }
    });
    
    await db.createCollection('upcomingcrops', {
      validator: {
        $jsonSchema: upcomingCropSchema.obj
      }
    });
    
    console.log('✅ Successfully created all collections with validation');
    return true;
  } catch (error) {
    console.error('❌ Error setting up collections:', error.message);
    return false;
  }
}

// Create indexes for better query performance
async function createIndexes() {
  try {
    // User indexes
    await mongoose.model('User', userSchema).createIndexes([
      { phone: 1 }, // For fast lookups by phone
      { role: 1 }   // For role-based queries
    ]);
    
    // Farmer indexes
    await mongoose.model('Farmer', farmerSchema).createIndexes([
      { userId: 1 },         // For fast lookups by user ID
      { kissanNumber: 1 }    // For fast lookups by KISAN number
    ]);
    
    // Customer indexes
    await mongoose.model('Customer', customerSchema).createIndexes([
      { userId: 1 }  // For fast lookups by user ID
    ]);
    
    // Crop indexes
    await mongoose.model('Crop', cropSchema).createIndexes([
      { farmerId: 1 },       // For fast lookups by farmer
      { isActive: 1 },       // For filtering active crops
      { 'location': '2dsphere' }  // For geospatial queries
    ]);
    
    // Message indexes
    await mongoose.model('Message', messageSchema).createIndexes([
      { senderId: 1, receiverId: 1 },  // For conversation lookups
      { createdAt: -1 }                // For sorting messages by date
    ]);
    
    // Order indexes
    await mongoose.model('Order', orderSchema).createIndexes([
      { customerId: 1 },     // For customer order history
      { cropId: 1 },         // For crop order history
      { status: 1 },         // For filtering by status
      { createdAt: -1 }      // For recent orders
    ]);
    
    console.log('✅ Successfully created indexes');
    return true;
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      process.exit(1);
    }
    
    // Set up collections
    const collectionsSetUp = await setupCollections();
    if (!collectionsSetUp) {
      throw new Error('Failed to set up collections');
    }
    
    // Create indexes
    const indexesCreated = await createIndexes();
    if (!indexesCreated) {
      throw new Error('Failed to create indexes');
    }
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\nCollections created:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(collections.map(c => `- ${c.name}`).join('\n'));
    
  } catch (error) {
    console.error('❌ Error during database setup:', error.message);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the setup
main();
