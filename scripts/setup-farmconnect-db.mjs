import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';

// Collection schemas
const schemas = {
  users: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['username', 'phone', 'password', 'role'],
        properties: {
          username: { bsonType: 'string' },
          phone: { bsonType: 'string' },
          password: { bsonType: 'string' },
          role: { 
            bsonType: 'string',
            enum: ['farmer', 'customer']
          },
          language: { bsonType: 'string' },
          isVerified: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { phone: 1 }, unique: true },
      { key: { role: 1 } }
    ]
  },
  farmers: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'kissanNumber'],
        properties: {
          userId: { bsonType: 'string' },
          kissanNumber: { bsonType: 'string' },
          bankAccountNumber: { bsonType: 'string' },
          ifscCode: { bsonType: 'string' },
          upiId: { bsonType: 'string' },
          stripeCustomerId: { bsonType: 'string' },
          rating: { bsonType: 'number' },
          totalReviews: { bsonType: 'number' }
        }
      }
    },
    indexes: [
      { key: { userId: 1 }, unique: true },
      { key: { kissanNumber: 1 } }
    ]
  },
  // Other collections with their schemas...
  crops: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['farmerId', 'name', 'quantity', 'pricePerUnit'],
        properties: {
          farmerId: { bsonType: 'string' },
          name: { bsonType: 'string' },
          quantity: { bsonType: 'number' },
          unit: { bsonType: 'string' },
          pricePerUnit: { bsonType: 'number' },
          description: { bsonType: 'string' },
          images: { bsonType: 'array', items: { bsonType: 'string' } },
          isActive: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { farmerId: 1 } },
      { key: { isActive: 1 } }
    ]
  },
  orders: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['customerId', 'cropId', 'quantity', 'totalPrice'],
        properties: {
          customerId: { bsonType: 'string' },
          cropId: { bsonType: 'string' },
          quantity: { bsonType: 'number' },
          totalPrice: { bsonType: 'number' },
          status: { bsonType: 'string' },
          paymentIntentId: { bsonType: 'string' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { customerId: 1 } },
      { key: { cropId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } }
    ]
  },
  messages: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['senderId', 'receiverId', 'content'],
        properties: {
          senderId: { bsonType: 'string' },
          receiverId: { bsonType: 'string' },
          content: { bsonType: 'string' },
          isRead: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { senderId: 1, receiverId: 1 } },
      { key: { createdAt: -1 } }
    ]
  },
  reviews: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['customerId', 'farmerId', 'cropId', 'rating'],
        properties: {
          customerId: { bsonType: 'string' },
          farmerId: { bsonType: 'string' },
          cropId: { bsonType: 'string' },
          rating: { 
            bsonType: 'number',
            minimum: 1,
            maximum: 5
          },
          comment: { bsonType: 'string' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { farmerId: 1 } },
      { key: { cropId: 1 } },
      { key: { createdAt: -1 } }
    ]
  },
  deliveryrequests: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['customerId', 'farmerId', 'cropId', 'quantity'],
        properties: {
          customerId: { bsonType: 'string' },
          farmerId: { bsonType: 'string' },
          cropId: { bsonType: 'string' },
          quantity: { bsonType: 'number' },
          proposedDeliveryPrice: { bsonType: 'number' },
          status: { bsonType: 'string' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { customerId: 1 } },
      { key: { farmerId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } }
    ]
  },
  upcomingcrops: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['farmerId', 'name', 'expectedHarvestDate'],
        properties: {
          farmerId: { bsonType: 'string' },
          name: { bsonType: 'string' },
          description: { bsonType: 'string' },
          expectedQuantity: { bsonType: 'number' },
          expectedPrice: { bsonType: 'number' },
          expectedHarvestDate: { bsonType: 'date' },
          isActive: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { farmerId: 1 } },
      { key: { expectedHarvestDate: 1 } },
      { key: { isActive: 1 } }
    ]
  }
};

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db();
    
    // Create or update collections
    for (const [collectionName, { validator, indexes }] of Object.entries(schemas)) {
      try {
        // Create collection with validation
        await db.createCollection(collectionName, { validator: validator.$jsonSchema });
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.codeName === 'NamespaceExists') {
          console.log(`ℹ️ Collection already exists: ${collectionName}`);
          
          // Update validation if collection exists
          await db.command({
            collMod: collectionName,
            validator: validator.$jsonSchema,
            validationLevel: 'strict'
          });
          console.log(`✅ Updated validation for collection: ${collectionName}`);
        } else {
          throw error;
        }
      }
      
      // Create indexes
      const collection = db.collection(collectionName);
      for (const index of indexes) {
        try {
          await collection.createIndex(index.key, { unique: index.unique });
          console.log(`   ✅ Created index on ${Object.keys(index.key).join(', ')}`);
        } catch (error) {
          if (error.code === 85) { // Index already exists with different options
            console.log(`   ℹ️ Index on ${Object.keys(index.key).join(', ')} already exists`);
          } else {
            console.error(`   ❌ Error creating index on ${Object.keys(index.key).join(', ')}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n✅ Database setup completed successfully!');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    console.log(collections.map(c => `- ${c.name}`).join('\n'));
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the setup
setupDatabase();
