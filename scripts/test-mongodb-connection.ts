import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function testConnection() {
  const mongoUrl = process.env.DATABASE_URL!;
  console.log('Testing MongoDB connection...');
  console.log('URL:', mongoUrl);
  
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database access
    const db = client.db('farmconnect');
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔌 Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
