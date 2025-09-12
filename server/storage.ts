import { users, farmers, customers, crops, messages, orders, reviews } from "@shared/schema";
import type { 
  User, Farmer, Customer, Crop, Message, Order, Review,
  InsertUser, InsertFarmer, InsertCustomer, InsertCrop, InsertMessage, InsertOrder, InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, or } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLanguage(id: string, language: string): Promise<User>;

  // Farmer management
  getFarmer(userId: string): Promise<Farmer | undefined>;
  getFarmerByKissan(kissanNumber: string): Promise<Farmer | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  updateFarmerPaymentDetails(id: string, details: Partial<Pick<Farmer, 'bankAccountNumber' | 'ifscCode' | 'upiId'>>): Promise<Farmer>;

  // Customer management
  getCustomer(userId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Crop management
  getCrop(id: string): Promise<Crop | undefined>;
  getCropsByFarmer(farmerId: string): Promise<Crop[]>;
  getCropsNearLocation(lat: number, lng: number, radius?: number): Promise<Crop[]>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: string, updates: Partial<Crop>): Promise<Crop>;
  deactivateCrop(id: string): Promise<void>;

  // Message management
  getConversations(userId: string): Promise<any[]>;
  getMessages(senderId: string, receiverId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesRead(senderId: string, receiverId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Order management
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByFarmer(farmerId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;

  // Review management
  createReview(review: InsertReview): Promise<Review>;
  getReviewsForFarmer(farmerId: string): Promise<Review[]>;
  getReviewsForCrop(cropId: string): Promise<Review[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLanguage(id: string, language: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ language })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getFarmer(userId: string): Promise<Farmer | undefined> {
    const [farmer] = await db.select().from(farmers).where(eq(farmers.userId, userId));
    return farmer || undefined;
  }

  async getFarmerByKissan(kissanNumber: string): Promise<Farmer | undefined> {
    const [farmer] = await db.select().from(farmers).where(eq(farmers.kissanNumber, kissanNumber));
    return farmer || undefined;
  }

  async createFarmer(insertFarmer: InsertFarmer): Promise<Farmer> {
    const [farmer] = await db.insert(farmers).values(insertFarmer).returning();
    return farmer;
  }

  async updateFarmerPaymentDetails(id: string, details: Partial<Pick<Farmer, 'bankAccountNumber' | 'ifscCode' | 'upiId'>>): Promise<Farmer> {
    const [farmer] = await db.update(farmers)
      .set(details)
      .where(eq(farmers.id, id))
      .returning();
    return farmer;
  }

  async getCustomer(userId: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.userId, userId));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async getCrop(id: string): Promise<Crop | undefined> {
    const [crop] = await db.select().from(crops).where(eq(crops.id, id));
    return crop || undefined;
  }

  async getCropsByFarmer(farmerId: string): Promise<Crop[]> {
    return db.select().from(crops)
      .where(and(eq(crops.farmerId, farmerId), eq(crops.isActive, true)))
      .orderBy(desc(crops.createdAt));
  }

  async getCropsNearLocation(lat: number, lng: number, radius: number = 10): Promise<Crop[]> {
    // This is a simplified implementation. For production, you'd use PostGIS for proper geographical queries
    return db.select().from(crops)
      .where(eq(crops.isActive, true))
      .orderBy(desc(crops.createdAt));
  }

  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const [crop] = await db.insert(crops).values(insertCrop).returning();
    return crop;
  }

  async updateCrop(id: string, updates: Partial<Crop>): Promise<Crop> {
    const [crop] = await db.update(crops)
      .set(updates)
      .where(eq(crops.id, id))
      .returning();
    return crop;
  }

  async deactivateCrop(id: string): Promise<void> {
    await db.update(crops)
      .set({ isActive: false })
      .where(eq(crops.id, id));
  }

  async getConversations(userId: string): Promise<any[]> {
    const conversations = await db.execute(sql`
      SELECT DISTINCT 
        CASE 
          WHEN sender_id = ${userId} THEN receiver_id 
          ELSE sender_id 
        END as other_user_id,
        u.username,
        u.role,
        (SELECT content FROM messages m2 
         WHERE (m2.sender_id = ${userId} AND m2.receiver_id = other_user_id) 
            OR (m2.sender_id = other_user_id AND m2.receiver_id = ${userId})
         ORDER BY m2.created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages m2 
         WHERE (m2.sender_id = ${userId} AND m2.receiver_id = other_user_id) 
            OR (m2.sender_id = other_user_id AND m2.receiver_id = ${userId})
         ORDER BY m2.created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages m2 
         WHERE m2.sender_id = other_user_id AND m2.receiver_id = ${userId} AND m2.is_read = false) as unread_count
      FROM messages m
      JOIN users u ON u.id = (CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END)
      WHERE sender_id = ${userId} OR receiver_id = ${userId}
      ORDER BY last_message_time DESC
    `);
    
    return conversations.rows;
  }

  async getMessages(senderId: string, receiverId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(
        or(
          and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId)),
          and(eq(messages.senderId, receiverId), eq(messages.receiverId, senderId))
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessagesRead(senderId: string, receiverId: string): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId),
          eq(messages.isRead, false)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );
    return result?.count || 0;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return db.select().from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByFarmer(farmerId: string): Promise<Order[]> {
    const result = await db.select({
      id: orders.id,
      customerId: orders.customerId,
      cropId: orders.cropId,
      quantity: orders.quantity,
      totalPrice: orders.totalPrice,
      status: orders.status,
      paymentIntentId: orders.paymentIntentId,
      createdAt: orders.createdAt,
    })
      .from(orders)
      .innerJoin(crops, eq(orders.cropId, crops.id))
      .where(eq(crops.farmerId, farmerId))
      .orderBy(desc(orders.createdAt));
    
    return result;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [order] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    
    // Update farmer's rating
    const avgRating = await db.select({ avg: sql<number>`AVG(rating)::numeric` })
      .from(reviews)
      .where(eq(reviews.farmerId, insertReview.farmerId));
    
    const totalReviews = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.farmerId, insertReview.farmerId));

    await db.update(farmers)
      .set({ 
        rating: avgRating[0]?.avg?.toString() || "0",
        totalReviews: totalReviews[0]?.count || 0
      })
      .where(eq(farmers.id, insertReview.farmerId));

    return review;
  }

  async getReviewsForFarmer(farmerId: string): Promise<Review[]> {
    return db.select().from(reviews)
      .where(eq(reviews.farmerId, farmerId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsForCrop(cropId: string): Promise<Review[]> {
    return db.select().from(reviews)
      .where(eq(reviews.cropId, cropId))
      .orderBy(desc(reviews.createdAt));
  }
}

export const storage = new DatabaseStorage();
