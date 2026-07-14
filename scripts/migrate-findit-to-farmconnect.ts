import 'dotenv/config';
import mongoose, { Connection } from 'mongoose';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// MongoDB connection string for source database (findit)
const sourceUrl = "mongodb+srv://farmconnect:Cham8497%40@findit.qejydei.mongodb.net/findit?retryWrites=true&w=majority";

// MongoDB connection string for target database (farmconnect)
const targetUrl = "mongodb+srv://farmconnect:Cham8497%40@findit.qejydei.mongodb.net/farmconnect?retryWrites=true&w=majority";

async function migrateDatabase() {
  console.log('🚀 Starting database migration from findit to farmconnect...');
  
  let sourceConnection: Connection | null = null;
  let targetConnection: Connection | null = null;
  
  try {
    // Connect to source database
    console.log('📡 Connecting to source database (findit)...');
    sourceConnection = await new Promise<Connection>((resolve, reject) => {
      const conn = mongoose.createConnection(sourceUrl);
      conn.once('connected', () => resolve(conn));
      conn.once('error', reject);
    });
    console.log('✅ Connected to source database');

    // Connect to target database
    console.log('📡 Connecting to target database (farmconnect)...');
    targetConnection = await new Promise<Connection>((resolve, reject) => {
      const conn = mongoose.createConnection(targetUrl);
      conn.once('connected', () => resolve(conn));
      conn.once('error', reject);
    });
    console.log('✅ Connected to target database');

    // Get all available collections first
    console.log('\n📋 Available collections in source database:');
    if (!sourceConnection?.db) {
      throw new Error('Source connection or database is not available');
    }
    const collections = await sourceConnection.db.listCollections().toArray();
    console.log('Collections found:', collections.map((c: any) => c.name));
    
    // Get counts before migration
    console.log('\n📊 Checking data in source database...');
    for (const collection of collections) {
      try {
        const sourceCollection = sourceConnection?.db?.collection(collection.name);
        if (!sourceCollection) {
          throw new Error(`Could not access collection ${collection.name}`);
        }
        const count = await sourceCollection.countDocuments();
        console.log(`  ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`  ${collection.name}: Error accessing collection`);
      }
    }

    // Clear target database before migration
    console.log('\n🗑️  Clearing target database...');
    for (const collection of collections) {
      try {
        const targetCollection = targetConnection?.db?.collection(collection.name);
        if (!targetCollection) {
          throw new Error(`Could not access collection ${collection.name}`);
        }
        await targetCollection.deleteMany({});
        console.log(`  Cleared ${collection.name}`);
      } catch (error) {
        console.log(`  ${collection.name}: Error clearing collection`);
      }
    }

    // Migrate each collection
    console.log('\n📦 Starting data migration...');
    let totalMigrated = 0;
    
    for (const collection of collections) {
      try {
        console.log(`  Migrating ${collection.name}...`);
        
        const sourceCollection = sourceConnection?.db?.collection(collection.name);
        if (!sourceCollection) {
          throw new Error(`Could not access collection ${collection.name}`);
        }
        const targetCollection = targetConnection?.db?.collection(collection.name);
        if (!targetCollection) {
          throw new Error(`Could not access collection ${collection.name}`);
        }
        
        // Get all documents from source
        const documents = await sourceCollection.find({}).toArray();
        
        if (documents.length > 0) {
          // Insert documents into target
          await targetCollection.insertMany(documents);
          console.log(`    ✅ Migrated ${documents.length} documents`);
          totalMigrated += documents.length;
        } else {
          console.log(`    ℹ️  No documents to migrate`);
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`    ❌ Error migrating ${collection.name}:`, errorMessage);
      }
    }

    console.log(`\n✅ Migration completed! Total documents migrated: ${totalMigrated}`);

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    for (const collection of collections) {
      try {
        const targetCollection = targetConnection?.db?.collection(collection.name);
        if (!targetCollection) {
          throw new Error(`Could not access collection ${collection.name}`);
        }
        const count = await targetCollection.countDocuments();
        console.log(`  ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`  ${collection.name}: Error verifying collection`);
      }
    }

    // Update .env file to point to farmconnect database
    console.log('\n📝 Updating .env file to point to farmconnect database...');
    try {
      const envPath = join(process.cwd(), '.env');
      let envContent = readFileSync(envPath, 'utf8');
      
      // Replace the DATABASE_URL with farmconnect database
      envContent = envContent.replace(
        /DATABASE_URL=.+/,
        `DATABASE_URL=${targetUrl}`
      );
      
      writeFileSync(envPath, envContent);
      console.log('✅ Updated .env file');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error updating .env file:', errorMessage);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Migration failed:', errorMessage);
  } finally {
    // Close connections
    try {
      if (sourceConnection) {
        await sourceConnection.close();
        console.log('📡 Closed source database connection');
      }
    } catch (e) {
      console.error('Error closing source connection:', e);
    }
    
    try {
      if (targetConnection) {
        await targetConnection.close();
        console.log('📡 Closed target database connection');
      }
    } catch (e) {
      console.error('Error closing target connection:', e);
    }
  }
}

// Run migration
migrateDatabase().then(() => {
  console.log('\n🎉 Database migration process completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Migration process failed:', error);
  process.exit(1);
});
