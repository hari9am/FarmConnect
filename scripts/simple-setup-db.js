const { MongoClient } = require('mongodb');
require('dotenv').config();

async function setupDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';
  console.log('Connecting to MongoDB at:', uri.replace(/\/\/.*@/, '//***@'));
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db();
    
    // List of collections to create
    const collections = [
      'users',
      'farmers',
      'customers',
      'crops',
      'messages',
      'orders',
      'reviews',
      'upcomingcrops',
      'deliveryrequests'
    ];
    
    // Create collections if they don't exist
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.codeName === 'NamespaceExists') {
          console.log(`ℹ️ Collection already exists: ${collectionName}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Database setup completed successfully!');
    
    // List all collections
    const allCollections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    console.log(allCollections.map(c => `- ${c.name}`).join('\n'));
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  } finally {
    await client.close();
  }
}

// Run the setup
setupDatabase();
