import { 
  User, Farmer, Customer, Crop, Message, Order, Review, UpcomingCrop, DeliveryRequest, MarketPrice,
  IUser, IFarmer, ICustomer, ICrop, IMessage, IOrder, IReview, IUpcomingCrop, IDeliveryRequest, IMarketPrice,
  InsertUser, InsertFarmer, InsertCustomer, InsertCrop, InsertMessage, InsertOrder, InsertReview, InsertUpcomingCrop, InsertDeliveryRequest, InsertMarketPrice
} from "@shared/mongodb-schema";
import { Types } from "mongoose";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<IUser | null>;
  getUserByPhone(phone: string): Promise<IUser | null>;
  createUser(user: InsertUser): Promise<IUser>;
  updateUser(id: string, updates: Partial<IUser>): Promise<IUser>;
  updateUserLanguage(id: string, language: string): Promise<IUser>;
  updateUserProfile(id: string, updates: Partial<Pick<IUser, 'username' | 'phone' | 'profilePhoto'>>): Promise<IUser>;
  updateUserPasswordByPhone(phone: string, hashedPassword: string): Promise<IUser>;

  // Farmer management
  getFarmer(id: string): Promise<IFarmer | null>;
  getFarmerByUserId(userId: string): Promise<IFarmer | null>;
  createFarmer(farmer: InsertFarmer): Promise<IFarmer>;
  updateFarmerProfile(id: string, updates: Partial<Pick<IFarmer, 'bankAccountNumber' | 'ifscCode' | 'upiId'>>): Promise<IFarmer>;
  updateFarmerStripeCustomerId(id: string, stripeCustomerId: string): Promise<IFarmer>;

  // Customer management
  getCustomer(id: string): Promise<ICustomer | null>;
  getCustomerByUserId(userId: string): Promise<ICustomer | null>;
  createCustomer(customer: InsertCustomer): Promise<ICustomer>;
  updateCustomerStripeCustomerId(id: string, stripeCustomerId: string): Promise<ICustomer>;

  // Crop management
  getCrop(id: string): Promise<ICrop | null>;
  getCropsByFarmerId(farmerId: string): Promise<ICrop[]>;
  getActiveCrops(): Promise<ICrop[]>;
  createCrop(crop: InsertCrop): Promise<ICrop>;
  updateCrop(id: string, updates: Partial<ICrop>): Promise<ICrop>;
  deleteCrop(id: string): Promise<boolean>;

  // Message management
  getMessage(id: string): Promise<IMessage | null>;
  getMessages(userId1: string, userId2: string): Promise<IMessage[]>;
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<IMessage[]>;
  getConversations(userId: string): Promise<any[]>;
  createMessage(message: InsertMessage): Promise<IMessage>;
  markMessageAsRead(id: string): Promise<IMessage>;
  markMessagesRead(userId: string, otherUserId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Order management
  getOrder(id: string): Promise<IOrder | null>;
  getOrdersByCustomerId(customerId: string): Promise<IOrder[]>;
  getOrdersByFarmerId(farmerId: string): Promise<IOrder[]>;
  createOrder(order: InsertOrder): Promise<IOrder>;
  updateOrderStatus(id: string, status: string): Promise<IOrder>;
  updateOrderPaymentIntent(id: string, paymentIntentId: string): Promise<IOrder>;

  // Review management
  getReview(id: string): Promise<IReview | null>;
  getReviewsByFarmerId(farmerId: string): Promise<IReview[]>;
  getReviewsByCropId(cropId: string): Promise<IReview[]>;
  createReview(review: InsertReview): Promise<IReview>;

  // Upcoming crop management
  getUpcomingCrop(id: string): Promise<IUpcomingCrop | null>;
  getUpcomingCropsByFarmerId(farmerId: string): Promise<IUpcomingCrop[]>;
  getAllUpcoming(): Promise<IUpcomingCrop[]>;
  createUpcomingCrop(upcomingCrop: InsertUpcomingCrop): Promise<IUpcomingCrop>;
  updateUpcomingCrop(id: string, updates: Partial<IUpcomingCrop>): Promise<IUpcomingCrop>;
  deleteUpcomingCrop(id: string): Promise<boolean>;

  // Delivery request management
  getDeliveryRequest(id: string): Promise<IDeliveryRequest | null>;
  getDeliveryRequestsByCustomerId(customerId: string): Promise<IDeliveryRequest[]>;
  getDeliveryRequestsByFarmerId(farmerId: string): Promise<IDeliveryRequest[]>;
  createDeliveryRequest(deliveryRequest: InsertDeliveryRequest): Promise<IDeliveryRequest>;
  updateDeliveryRequestStatus(id: string, status: string): Promise<IDeliveryRequest>;
  updateDeliveryRequestPrice(id: string, proposedDeliveryPrice: number): Promise<IDeliveryRequest>;
  updateDeliveryRequest(id: string, updates: Partial<IDeliveryRequest>): Promise<IDeliveryRequest>;

  // Account management
  deleteAccount(userId: string): Promise<boolean>;
}

export class MongoDBStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<IUser | null> {
    return await User.findOne({ $or: [{ _id: id }, { originalId: id }] });
  }

  async getUserByPhone(phone: string): Promise<IUser | null> {
    try {
      return await User.findOne({ phone }).maxTimeMS(5000);
    } catch (error: any) {
      console.error('Error in getUserByPhone:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  async createUser(user: InsertUser): Promise<IUser> {
    try {
      const newUser = new User({
        ...user,
        originalId: randomUUID()
      });
      return await newUser.save();
    } catch (error: any) {
      console.error('Error in createUser:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      updates,
      { new: true }
    );
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateUserLanguage(id: string, language: string): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      { language },
      { new: true }
    );
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<Pick<IUser, 'username' | 'phone' | 'profilePhoto'>>): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      updates,
      { new: true }
    );
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateUserPasswordByPhone(phone: string, hashedPassword: string): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { phone },
      { password: hashedPassword },
      { new: true }
    );
    if (!user) throw new Error('User not found');
    return user;
  }

  // Farmer management
  async getFarmer(id: string): Promise<IFarmer | null> {
    return await Farmer.findOne({ $or: [{ _id: id }, { originalId: id }] });
  }

  async getFarmerByUserId(userId: string): Promise<IFarmer | null> {
    console.log("Looking for farmer with userId:", userId);
    const farmer = await Farmer.findOne({ userId });
    console.log("Farmer found:", farmer ? "Yes" : "No");
    if (!farmer) {
      // Let's also check what farmers exist
      const allFarmers = await Farmer.find({}).limit(5);
      console.log("Available farmers:", allFarmers.map(f => ({ id: f.id, userId: f.userId })));
    }
    return farmer;
  }

  async createFarmer(farmer: InsertFarmer): Promise<IFarmer> {
    try {
      const newFarmer = new Farmer({
        ...farmer,
        originalId: randomUUID()
      });
      return await newFarmer.save();
    } catch (error: any) {
      console.error('Error in createFarmer:', error);
      throw new Error(`Failed to create farmer profile: ${error.message}`);
    }
  }

  async updateFarmerProfile(id: string, updates: Partial<Pick<IFarmer, 'bankAccountNumber' | 'ifscCode' | 'upiId'>>): Promise<IFarmer> {
    const farmer = await Farmer.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      updates,
      { new: true }
    );
    if (!farmer) throw new Error('Farmer not found');
    return farmer;
  }

  async updateFarmerStripeCustomerId(id: string, stripeCustomerId: string): Promise<IFarmer> {
    const farmer = await Farmer.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      { stripeCustomerId },
      { new: true }
    );
    if (!farmer) throw new Error('Farmer not found');
    return farmer;
  }

  // Customer management
  async getCustomer(id: string): Promise<ICustomer | null> {
    return await Customer.findOne({ $or: [{ _id: id }, { originalId: id }] });
  }

  async getCustomerByUserId(userId: string): Promise<ICustomer | null> {
    return await Customer.findOne({ userId });
  }

  async createCustomer(customer: InsertCustomer): Promise<ICustomer> {
    const newCustomer = new Customer({
      ...customer,
      originalId: randomUUID()
    });
    return await newCustomer.save();
  }

  async updateCustomerStripeCustomerId(id: string, stripeCustomerId: string): Promise<ICustomer> {
    const customer = await Customer.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      { stripeCustomerId },
      { new: true }
    );
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  // Crop management
  async getCrop(id: string): Promise<ICrop | null> {
    return await Crop.findOne({ $or: [{ _id: id }, { originalId: id }] });
  }

  async getCropsByFarmerId(farmerId: string): Promise<ICrop[]> {
    return await Crop.find({ farmerId });
  }

  async getActiveCrops(): Promise<ICrop[]> {
    return await Crop.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async createCrop(crop: InsertCrop): Promise<ICrop> {
    const newCrop = new Crop({
      ...crop,
      originalId: randomUUID()
    });
    return await newCrop.save();
  }

  async updateCrop(id: string, updates: Partial<ICrop>): Promise<ICrop> {
    const crop = await Crop.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      updates,
      { new: true }
    );
    if (!crop) throw new Error('Crop not found');
    return crop;
  }

  async deleteCrop(id: string): Promise<boolean> {
    const result = await Crop.deleteOne({ $or: [{ _id: id }, { originalId: id }] });
    return result.deletedCount > 0;
  }

  // Message management
  async getMessage(id: string): Promise<IMessage | null> {
    return await Message.findOne({ $or: [{ _id: id }, { originalId: id }] });
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<IMessage[]> {
    return await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ createdAt: 1 });
  }

  // Alias for getMessagesBetweenUsers to match route expectations
  async getMessages(userId1: string, userId2: string): Promise<IMessage[]> {
    return this.getMessagesBetweenUsers(userId1, userId2);
  }

  async getConversations(userId: string): Promise<any[]> {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiverId", userId] }, { $eq: ["$isRead", false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Fetch user details for each conversation
    const conversationsWithUserDetails = await Promise.all(
      messages.map(async (conv: any) => {
        const otherUser = await this.getUser(conv._id);
        return {
          other_user_id: conv._id,
          username: otherUser?.username || "Unknown",
          role: otherUser?.role || "customer",
          last_message: conv.lastMessage?.content || "",
          last_message_time: conv.lastMessage?.createdAt || null,
          unread_count: conv.unreadCount || 0
        };
      })
    );

    return conversationsWithUserDetails;
  }

  async createMessage(message: InsertMessage): Promise<IMessage> {
    const newMessage = new Message({
      ...message,
      originalId: randomUUID()
    });
    return await newMessage.save();
  }

  async markMessageAsRead(id: string): Promise<IMessage> {
    const message = await Message.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      { isRead: true },
      { new: true }
    );
    if (!message) throw new Error('Message not found');
    return message;
  }

  async markMessagesRead(userId: string, otherUserId: string): Promise<void> {
    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return await Message.countDocuments({ receiverId: userId, isRead: false });
  }

  // Order management
  async getOrder(id: string): Promise<IOrder | null> {
    return await Order.findOne({ $or: [{ _id: id }, { originalId: id }] });
  }

  async getOrdersByCustomerId(customerId: string): Promise<IOrder[]> {
    return await Order.find({ customerId }).sort({ createdAt: -1 });
  }

  async getOrdersByFarmerId(farmerId: string): Promise<IOrder[]> {
    // Need to join with crops to get orders for a farmer
    const crops = await Crop.find({ farmerId }).select('_id originalId');
    const cropIds = crops.map(crop => (crop._id as Types.ObjectId).toString());
    const originalCropIds = crops.map(crop => crop.originalId).filter(Boolean);
    
    return await Order.find({ 
      cropId: { $in: [...cropIds, ...originalCropIds] } 
    }).sort({ createdAt: -1 });
  }

  async createOrder(order: InsertOrder): Promise<IOrder> {
    const newOrder = new Order({
      ...order,
      originalId: randomUUID()
    });
    return await newOrder.save();
  }

  async updateOrderStatus(id: string, status: string): Promise<IOrder> {
    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      { status },
      { new: true }
    );
    if (!order) throw new Error('Order not found');
    return order;
  }

  async updateOrderPaymentIntent(id: string, paymentIntentId: string): Promise<IOrder> {
    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      { paymentIntentId },
      { new: true }
    );
    if (!order) throw new Error('Order not found');
    return order;
  }

  // Review management
  async getReview(id: string): Promise<IReview | null> {
    return await Review.findOne({ $or: [{ _id: id }, { originalId: id }] });
  }

  async getReviewsByFarmerId(farmerId: string): Promise<IReview[]> {
    return await Review.find({ farmerId }).sort({ createdAt: -1 });
  }

  async getReviewsByCropId(cropId: string): Promise<IReview[]> {
    return await Review.find({ cropId }).sort({ createdAt: -1 });
  }

  async createReview(review: InsertReview): Promise<IReview> {
    const newReview = new Review({
      ...review,
      originalId: randomUUID()
    });
    return await newReview.save();
  }

  // Upcoming crop management
  async getUpcomingCrop(id: string): Promise<IUpcomingCrop | null> {
    return await UpcomingCrop.findOne({ $or: [{ _id: id }, { originalId: id }] });
  }

  async getUpcomingCropsByFarmerId(farmerId: string): Promise<IUpcomingCrop[]> {
    return await UpcomingCrop.find({ farmerId }).sort({ createdAt: -1 });
  }

  async getAllUpcoming(): Promise<IUpcomingCrop[]> {
    return await UpcomingCrop.find({}).sort({ createdAt: -1 });
  }

  async createUpcomingCrop(upcomingCrop: InsertUpcomingCrop): Promise<IUpcomingCrop> {
    const newUpcomingCrop = new UpcomingCrop({
      ...upcomingCrop,
      originalId: randomUUID()
    });
    return await newUpcomingCrop.save();
  }

  async updateUpcomingCrop(id: string, updates: Partial<IUpcomingCrop>): Promise<IUpcomingCrop> {
    const upcomingCrop = await UpcomingCrop.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      updates,
      { new: true }
    );
    if (!upcomingCrop) throw new Error('Upcoming crop not found');
    return upcomingCrop;
  }

  async deleteUpcomingCrop(id: string): Promise<boolean> {
    const result = await UpcomingCrop.deleteOne({ $or: [{ _id: id }, { originalId: id }] });
    return result.deletedCount > 0;
  }

  // Delivery request management
  async getDeliveryRequest(id: string): Promise<IDeliveryRequest | null> {
    return await DeliveryRequest.findOne({ $or: [{ _id: id }, { originalId: id }] });
  }

  async getDeliveryRequestsByCustomerId(customerId: string): Promise<IDeliveryRequest[]> {
    return await DeliveryRequest.find({ customerId }).sort({ createdAt: -1 });
  }

  async getDeliveryRequestsByFarmerId(farmerId: string): Promise<IDeliveryRequest[]> {
    return await DeliveryRequest.find({ farmerId }).sort({ createdAt: -1 });
  }

  async createDeliveryRequest(deliveryRequest: InsertDeliveryRequest): Promise<IDeliveryRequest> {
    const newDeliveryRequest = new DeliveryRequest({
      ...deliveryRequest,
      originalId: randomUUID()
    });
    return await newDeliveryRequest.save();
  }

  async updateDeliveryRequestStatus(id: string, status: string): Promise<IDeliveryRequest> {
    const deliveryRequest = await DeliveryRequest.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      { status },
      { new: true }
    );
    if (!deliveryRequest) throw new Error('Delivery request not found');
    return deliveryRequest;
  }

  async updateDeliveryRequestPrice(id: string, proposedDeliveryPrice: number): Promise<IDeliveryRequest> {
    const deliveryRequest = await DeliveryRequest.findOneAndUpdate(
      { $or: [{ _id: id }, { originalId: id }] },
      { proposedDeliveryPrice },
      { new: true }
    );
    if (!deliveryRequest) throw new Error('Delivery request not found');
    return deliveryRequest;
  }

  async updateDeliveryRequest(id: string, updates: Partial<IDeliveryRequest>): Promise<IDeliveryRequest> {
    try {
      const deliveryRequest = await DeliveryRequest.findOneAndUpdate(
        { $or: [{ _id: id }, { originalId: id }] },
        updates,
        { new: true }
      );
      if (!deliveryRequest) throw new Error('Delivery request not found');
      return deliveryRequest;
    } catch (error: any) {
      console.error('Error in updateDeliveryRequest:', error);
      throw new Error(`Failed to update delivery request: ${error.message}`);
    }
  }

  // Market price management
  async getMarketPrice(id: string): Promise<IMarketPrice | null> {
    try {
      return await MarketPrice.findOne({ $or: [{ _id: id }, { originalId: id }] });
    } catch (error: any) {
      console.error('Error in getMarketPrice:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  async getMarketPrices(commodity?: string, state?: string, district?: string): Promise<IMarketPrice[]> {
    try {
      const query: any = {};
      if (commodity) query.commodity = commodity;
      if (state) query.state = state;
      if (district) query.district = district;
      
      return await MarketPrice.find(query).sort({ createdAt: -1 }).limit(100);
    } catch (error: any) {
      console.error('Error in getMarketPrices:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  async createMarketPrice(price: InsertMarketPrice): Promise<IMarketPrice> {
    try {
      const newPrice = new MarketPrice({
        ...price,
        originalId: randomUUID()
      });
      return await newPrice.save();
    } catch (error: any) {
      console.error('Error in createMarketPrice:', error);
      throw new Error(`Failed to create market price: ${error.message}`);
    }
  }

  async updateMarketPrice(id: string, updates: Partial<IMarketPrice>): Promise<IMarketPrice> {
    try {
      const marketPrice = await MarketPrice.findOneAndUpdate(
        { $or: [{ _id: id }, { originalId: id }] },
        updates,
        { new: true }
      );
      if (!marketPrice) throw new Error('Market price not found');
      return marketPrice;
    } catch (error: any) {
      console.error('Error in updateMarketPrice:', error);
      throw new Error(`Failed to update market price: ${error.message}`);
    }
  }

  async deleteMarketPrice(id: string): Promise<boolean> {
    try {
      const result = await MarketPrice.findOneAndDelete(
        { $or: [{ _id: id }, { originalId: id }] }
      );
      return result !== null;
    } catch (error: any) {
      console.error('Error in deleteMarketPrice:', error);
      throw new Error(`Failed to delete market price: ${error.message}`);
    }
  }

  // Account management
  async deleteAccount(userId: string): Promise<boolean> {
    try {
      // Get user to determine role
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Delete related data based on role
      if (user.role === 'farmer') {
        const farmer = await this.getFarmerByUserId(userId);
        if (farmer) {
          // Delete farmer's crops
          await Crop.deleteMany({ farmerId: farmer.id });
          // Delete farmer's upcoming crops
          await UpcomingCrop.deleteMany({ farmerId: farmer.id });
          // Delete delivery requests for farmer
          await DeliveryRequest.deleteMany({ farmerId: farmer.id });
          // Delete reviews for farmer
          await Review.deleteMany({ farmerId: farmer.id });
          // Delete farmer profile
          await Farmer.findByIdAndDelete(farmer.id);
        }
      } else if (user.role === 'customer') {
        const customer = await this.getCustomerByUserId(userId);
        if (customer) {
          // Delete customer's orders
          await Order.deleteMany({ customerId: customer.id });
          // Delete delivery requests for customer
          await DeliveryRequest.deleteMany({ customerId: customer.id });
          // Delete reviews by customer
          await Review.deleteMany({ customerId: customer.id });
          // Delete customer profile
          await Customer.findByIdAndDelete(customer.id);
        }
      }

      // Delete messages where user is sender or receiver
      await Message.deleteMany({
        $or: [{ senderId: userId }, { receiverId: userId }]
      });

      // Finally delete the user
      await User.findByIdAndDelete(userId);
      
      return true;
    } catch (error: any) {
      console.error('Error in deleteAccount:', error);
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  }
}
