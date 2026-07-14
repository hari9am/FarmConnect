import 'dotenv/config';
import { connectToMongoDB, disconnectFromMongoDB, mongoose } from '../server/mongodb';

async function resetMongoDb() {
  const hasYesFlag = process.argv.includes('--yes');

  if (!hasYesFlag) {
    console.error('❌ Refusing to reset MongoDB without confirmation flag.');
    console.error('Run: npm run db:reset -- --yes');
    process.exit(1);
  }

  console.log('⚠️ Resetting MongoDB database: this will DROP ALL collections/data.');

  const conn = await connectToMongoDB();
  if (!conn) {
    console.error('❌ Could not connect to MongoDB. Reset aborted.');
    process.exit(1);
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB db handle not available');
    }

    const dbName = db.databaseName;
    console.log(`Dropping database: ${dbName}`);
    await db.dropDatabase();
    console.log('✅ Database dropped successfully');
  } catch (err: any) {
    console.error('❌ Failed to drop database:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await disconnectFromMongoDB();
  }
}

resetMongoDb();
