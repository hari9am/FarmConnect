import 'dotenv/config';
import mongoose from 'mongoose';
import { join } from 'path';

// MongoDB connection strings
const finditUrl = "mongodb+srv://farmconnect:Cham8497%40@findit.qejydei.mongodb.net/findit?retryWrites=true&w=majority";
const farmconnectUrl = "mongodb+srv://farmconnect:Cham8497%40@findit.qejydei.mongodb.net/farmconnect?retryWrites=true&w=majority";

// FarmConnect project collections to manage
const farmConnectCollections = [
  'customers',
  'orders', 
  'upcomingcrops',
  'users',
  'items',
  'notifications',
  'crops',
  'sessions',
  'farmers',
  'messages',
  'reviews',
  'deliveryrequests',
  'marketprices'
];

async function cleanupAndCreateCollections() {
  console.log('🧹 Starting cleanup and collection management...');
  
  let finditDb, farmconnectDb;
  
  try {
    // Connect to findit database
    console.log('📡 Connecting to findit database...');
    const finditConnection = await mongoose.createConnection(finditUrl);
    finditDb = finditConnection.asPromise ? await finditConnection.asPromise() : finditConnection;
    console.log('✅ Connected to findit database');

    // Connect to farmconnect database
    console.log('📡 Connecting to farmconnect database...');
    const farmconnectConnection = await mongoose.createConnection(farmconnectUrl);
    farmconnectDb = farmconnectConnection.asPromise ? await farmconnectConnection.asPromise() : farmconnectConnection;
    console.log('✅ Connected to farmconnect database');

    // Step 1: Show current state of both databases
    console.log('\n📊 Current database state:');
    
    console.log('\n--- Findit Database Collections ---');
    const finditCollections = await finditDb.db.listCollections().toArray();
    console.log('Collections in findit:', finditCollections.map(c => c.name));
    
    console.log('\n--- Farmconnect Database Collections ---');
    const farmconnectCollections = await farmconnectDb.db.listCollections().toArray();
    console.log('Collections in farmconnect:', farmconnectCollections.map(c => c.name));

    // Step 2: Remove FarmConnect collections from findit database
    console.log('\n🗑️  Removing FarmConnect collections from findit database...');
    let removedCount = 0;
    
    for (const collectionName of farmConnectCollections) {
      try {
        const exists = finditCollections.some(c => c.name === collectionName);
        if (exists) {
          await finditDb.db.collection(collectionName).drop();
          console.log(`  ✅ Dropped collection: ${collectionName}`);
          removedCount++;
        } else {
          console.log(`  ℹ️  Collection ${collectionName} does not exist in findit`);
        }
      } catch (error) {
        console.log(`  ❌ Error dropping ${collectionName}: ${error.message}`);
      }
    }
    
    console.log(`\n📋 Summary: Removed ${removedCount} collections from findit database`);

    // Step 3: Ensure all collections exist in farmconnect database
    console.log('\n➕ Ensuring collections exist in farmconnect database...');
    let createdCount = 0;
    
    for (const collectionName of farmConnectCollections) {
      try {
        const exists = farmconnectCollections.some(c => c.name === collectionName);
        if (!exists) {
          // Create collection by inserting and immediately deleting a dummy document
          const collection = farmconnectDb.db.collection(collectionName);
          await collection.insertOne({ _temp: true });
          await collection.deleteOne({ _temp: true });
          console.log(`  ✅ Created collection: ${collectionName}`);
          createdCount++;
        } else {
          console.log(`  ✅ Collection ${collectionName} already exists in farmconnect`);
        }
      } catch (error) {
        console.log(`  ❌ Error creating ${collectionName}: ${error.message}`);
      }
    }
    
    console.log(`\n📋 Summary: Created ${createdCount} new collections in farmconnect database`);

    // Step 4: Final verification
    console.log('\n🔍 Final verification:');
    
    console.log('\n--- Findit Database After Cleanup ---');
    const finalFinditCollections = await finditDb.db.listCollections().toArray();
    const remainingFarmConnectCollections = finalFinditCollections
      .filter(c => farmConnectCollections.includes(c.name))
      .map(c => c.name);
    
    if (remainingFarmConnectCollections.length === 0) {
      console.log('✅ All FarmConnect collections removed from findit database');
    } else {
      console.log('⚠️  Remaining FarmConnect collections in findit:', remainingFarmConnectCollections);
    }
    
    console.log('\n--- Farmconnect Database Final State ---');
    const finalFarmconnectCollections = await farmconnectDb.db.listCollections().toArray();
    const farmConnectCollectionsInTarget = finalFarmconnectCollections
      .filter(c => farmConnectCollections.includes(c.name))
      .map(c => c.name);
    
    console.log('✅ FarmConnect collections in farmconnect:', farmConnectCollectionsInTarget);
    
    console.log('\n🎉 Cleanup and collection management completed!');

  } catch (error) {
    console.error('❌ Operation failed:', error);
  } finally {
    // Close connections
    if (finditDb) {
      await finditDb.close();
      console.log('📡 Closed findit database connection');
    }
    if (farmconnectDb) {
      await farmconnectDb.close();
      console.log('📡 Closed farmconnect database connection');
    }
  }
}

// Run the cleanup and creation process
cleanupAndCreateCollections().then(() => {
  console.log('\n✨ All operations completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Operation failed:', error);
  process.exit(1);
});
