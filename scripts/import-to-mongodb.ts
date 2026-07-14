import 'dotenv/config';
import { connectToMongoDB } from '../server/mongodb';
import { 
  User, Farmer, Customer, Crop, Message, Order, Review, UpcomingCrop, DeliveryRequest 
} from '../shared/mongodb-schema';
import fs from 'fs';

async function importDataToMongoDB() {
  try {
    console.log('🔄 Starting data import to MongoDB...');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectToMongoDB();

    // Read the exported JSON data
    console.log('📖 Reading exported MySQL data...');
    const jsonData = JSON.parse(fs.readFileSync('mysql-export.json', 'utf8'));

    // Import users
    if (jsonData.users && jsonData.users.length > 0) {
      console.log(`👥 Importing ${jsonData.users.length} users...`);
      const users = jsonData.users.map((user: any) => ({
        originalId: user.id,
        username: user.username,
        phone: user.phone,
        password: user.password,
        role: user.role,
        language: user.language || 'english',
        isVerified: user.is_verified || false,
        createdAt: new Date(user.created_at)
      }));
      await User.insertMany(users);
      console.log('✅ Users imported');
    }

    // Import farmers
    if (jsonData.farmers && jsonData.farmers.length > 0) {
      console.log(`🚜 Importing ${jsonData.farmers.length} farmers...`);
      const farmers = jsonData.farmers.map((farmer: any) => ({
        originalId: farmer.id,
        userId: farmer.userId,
        kissanNumber: farmer.kissanNumber,
        bankAccountNumber: farmer.bankAccountNumber,
        ifscCode: farmer.ifscCode,
        upiId: farmer.upiId,
        stripeCustomerId: farmer.stripeCustomerId,
        rating: parseFloat(farmer.rating) || 0,
        totalReviews: farmer.totalReviews || 0
      }));
      await Farmer.insertMany(farmers);
      console.log('✅ Farmers imported');
    }

    // Import customers
    if (jsonData.customers && jsonData.customers.length > 0) {
      console.log(`🛒 Importing ${jsonData.customers.length} customers...`);
      const customers = jsonData.customers.map((customer: any) => ({
        originalId: customer.id,
        userId: customer.userId,
        stripeCustomerId: customer.stripeCustomerId
      }));
      await Customer.insertMany(customers);
      console.log('✅ Customers imported');
    }

    // Import crops
    if (jsonData.crops && jsonData.crops.length > 0) {
      console.log(`🌾 Importing ${jsonData.crops.length} crops...`);
      const crops = jsonData.crops.map((crop: any) => ({
        originalId: crop.id,
        farmerId: crop.farmerId,
        name: crop.name,
        quantity: crop.quantity,
        unit: crop.unit || 'kg',
        pricePerUnit: parseFloat(crop.pricePerUnit),
        description: crop.description,
        images: crop.images,
        location: crop.location,
        expiryDate: crop.expiryDate ? new Date(crop.expiryDate) : undefined,
        isActive: crop.isActive !== false,
        createdAt: new Date(crop.createdAt)
      }));
      await Crop.insertMany(crops);
      console.log('✅ Crops imported');
    }

    // Import messages
    if (jsonData.messages && jsonData.messages.length > 0) {
      console.log(`💬 Importing ${jsonData.messages.length} messages...`);
      const messages = jsonData.messages.map((message: any) => ({
        originalId: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        isRead: message.isRead || false,
        createdAt: new Date(message.createdAt)
      }));
      await Message.insertMany(messages);
      console.log('✅ Messages imported');
    }

    // Import orders
    if (jsonData.orders && jsonData.orders.length > 0) {
      console.log(`📦 Importing ${jsonData.orders.length} orders...`);
      const orders = jsonData.orders.map((order: any) => ({
        originalId: order.id,
        customerId: order.customerId,
        cropId: order.cropId,
        quantity: order.quantity,
        totalPrice: parseFloat(order.totalPrice),
        status: order.status || 'pending',
        paymentIntentId: order.paymentIntentId,
        createdAt: new Date(order.createdAt)
      }));
      await Order.insertMany(orders);
      console.log('✅ Orders imported');
    }

    // Import reviews
    if (jsonData.reviews && jsonData.reviews.length > 0) {
      console.log(`⭐ Importing ${jsonData.reviews.length} reviews...`);
      const reviews = jsonData.reviews.map((review: any) => ({
        originalId: review.id,
        customerId: review.customerId,
        farmerId: review.farmerId,
        cropId: review.cropId,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.createdAt)
      }));
      await Review.insertMany(reviews);
      console.log('✅ Reviews imported');
    }

    // Import upcoming crops
    if (jsonData.upcoming_crops && jsonData.upcoming_crops.length > 0) {
      console.log(`🌱 Importing ${jsonData.upcoming_crops.length} upcoming crops...`);
      const upcomingCrops = jsonData.upcoming_crops.map((crop: any) => ({
        originalId: crop.id,
        farmerId: crop.farmerId,
        name: crop.name,
        plantedDate: crop.plantedDate ? new Date(crop.plantedDate) : undefined,
        yieldTime: crop.yieldTime,
        photoUrl: crop.photoUrl,
        location: crop.location,
        createdAt: new Date(crop.createdAt)
      }));
      await UpcomingCrop.insertMany(upcomingCrops);
      console.log('✅ Upcoming crops imported');
    }

    // Import delivery requests
    if (jsonData.delivery_requests && jsonData.delivery_requests.length > 0) {
      console.log(`🚚 Importing ${jsonData.delivery_requests.length} delivery requests...`);
      const deliveryRequests = jsonData.delivery_requests.map((request: any) => ({
        originalId: request.id,
        customerId: request.customerId,
        farmerId: request.farmerId,
        cropId: request.cropId,
        quantity: request.quantity,
        proposedDeliveryPrice: request.proposedDeliveryPrice ? parseFloat(request.proposedDeliveryPrice) : undefined,
        status: request.status || 'requested',
        createdAt: new Date(request.createdAt)
      }));
      await DeliveryRequest.insertMany(deliveryRequests);
      console.log('✅ Delivery requests imported');
    }

    console.log('🎉 All data imported successfully to MongoDB!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run import
importDataToMongoDB().catch(console.error);
