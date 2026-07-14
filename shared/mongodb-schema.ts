import mongoose, { Schema, Document, Types } from 'mongoose';
import { z } from 'zod';

// User Schema
export interface IUser extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  username: string;
  phone: string;
  password?: string;
  role: 'farmer' | 'customer';
  language: string;
  isVerified: boolean;
  phoneVerified: boolean;
  profilePhoto?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  originalId: { type: String, unique: true, sparse: true },
  username: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, default: '' },
  role: { type: String, enum: ['farmer', 'customer'], required: true },
  language: { type: String, default: 'english' },
  isVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  profilePhoto: { type: String, default: undefined },
  createdAt: { type: Date, default: Date.now }
});

// Farmer Schema
export interface IFarmer extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  userId: string;
  kissanNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  stripeCustomerId?: string;
  rating: number;
  totalReviews: number;
}

const farmerSchema = new Schema<IFarmer>({
  originalId: { type: String, unique: true, sparse: true },
  userId: { type: String, required: true, ref: 'User' },
  kissanNumber: String,
  bankAccountNumber: String,
  ifscCode: String,
  upiId: String,
  stripeCustomerId: String,
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
});

// Customer Schema
export interface ICustomer extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  userId: string;
  stripeCustomerId?: string;
}

const customerSchema = new Schema<ICustomer>({
  originalId: { type: String, unique: true, sparse: true },
  userId: { type: String, required: true, ref: 'User' },
  stripeCustomerId: String
});

// Crop Schema
export interface ICrop extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  farmerId: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  description?: string;
  images?: string[];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

const cropSchema = new Schema<ICrop>({
  originalId: { type: String, unique: true, sparse: true },
  farmerId: { type: String, required: true, ref: 'Farmer' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  pricePerUnit: { type: Number, required: true },
  description: String,
  images: [String],
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  expiryDate: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Message Schema
export interface IMessage extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  originalId: { type: String, unique: true, sparse: true },
  senderId: { type: String, required: true, ref: 'User' },
  receiverId: { type: String, required: true, ref: 'User' },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
export interface IOrder extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  customerId: string;
  cropId: string;
  quantity: number;
  totalPrice: number;
  status: string;
  paymentIntentId?: string;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  originalId: { type: String, unique: true, sparse: true },
  customerId: { type: String, required: true, ref: 'Customer' },
  cropId: { type: String, required: true, ref: 'Crop' },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  paymentIntentId: String,
  createdAt: { type: Date, default: Date.now }
});

// Delivery Request Schema
export interface IDeliveryRequest extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  customerId: string;
  farmerId: string;
  cropId: string;
  quantity: number;
  proposedDeliveryPrice?: number;
  status: string;
  createdAt: Date;
}

const deliveryRequestSchema = new Schema<IDeliveryRequest>({
  originalId: { type: String, unique: true, sparse: true },
  customerId: { type: String, required: true, ref: 'Customer' },
  farmerId: { type: String, required: true, ref: 'Farmer' },
  cropId: { type: String, required: true, ref: 'Crop' },
  quantity: { type: Number, required: true },
  proposedDeliveryPrice: Number,
  status: { type: String, default: 'requested' },
  createdAt: { type: Date, default: Date.now }
});

// Review Schema
export interface IReview extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  customerId: string;
  farmerId: string;
  cropId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
  originalId: { type: String, unique: true, sparse: true },
  customerId: { type: String, required: true, ref: 'Customer' },
  farmerId: { type: String, required: true, ref: 'Farmer' },
  cropId: { type: String, required: true, ref: 'Crop' },
  rating: { type: Number, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

// Upcoming Crop Schema
export interface IUpcomingCrop extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  farmerId: string;
  name: string;
  plantedDate?: Date;
  yieldTime?: {
    years?: number;
    months?: number;
    days?: number;
  };
  photoUrl?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: Date;
}

const upcomingCropSchema = new Schema<IUpcomingCrop>({
  originalId: { type: String, unique: true, sparse: true },
  farmerId: { type: String, required: true, ref: 'Farmer' },
  name: { type: String, required: true },
  plantedDate: Date,
  yieldTime: {
    years: Number,
    months: Number,
    days: Number
  },
  photoUrl: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Market Price Schema
export interface IMarketPrice extends Document {
  _id: Types.ObjectId;
  originalId?: string;
  commodity: string;
  category: string;
  price: number;
  unit: string;
  market: string;
  state: string;
  district: string;
  date: Date;
  minPrice: number;
  maxPrice: number;
  yesterdayPrice: number;
  trend: 'up' | 'down' | 'stable';
  createdAt: Date;
}

const marketPriceSchema = new Schema<IMarketPrice>({
  originalId: { type: String, unique: true, sparse: true },
  commodity: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  market: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  date: { type: Date, required: true },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  yesterdayPrice: { type: Number, required: true },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  createdAt: { type: Date, default: Date.now }
});

// Create Models
export const User = mongoose.model<IUser>('User', userSchema);
export const Farmer = mongoose.model<IFarmer>('Farmer', farmerSchema);
export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
export const Crop = mongoose.model<ICrop>('Crop', cropSchema);
export const Message = mongoose.model<IMessage>('Message', messageSchema);
export const Order = mongoose.model<IOrder>('Order', orderSchema);
export const DeliveryRequest = mongoose.model<IDeliveryRequest>('DeliveryRequest', deliveryRequestSchema);
export const Review = mongoose.model<IReview>('Review', reviewSchema);
export const UpcomingCrop = mongoose.model<IUpcomingCrop>('UpcomingCrop', upcomingCropSchema);
export const MarketPrice = mongoose.model<IMarketPrice>('MarketPrice', marketPriceSchema);

// Validation schemas using Zod
export const insertUserSchema = z.object({
  username: z.string(),
  phone: z.string(),
  password: z.string().optional().default(''),
  role: z.enum(['farmer', 'customer']),
  language: z.string().default('english'),
  isVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
  profilePhoto: z.string().optional()
});

export const insertFarmerSchema = z.object({
  userId: z.string(),
  kissanNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  rating: z.number().default(0),
  totalReviews: z.number().default(0)
});

export const insertCustomerSchema = z.object({
  userId: z.string(),
  stripeCustomerId: z.string().optional()
});

export const insertCropSchema = z.object({
  farmerId: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string().default('kg'),
  pricePerUnit: z.number(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string()
  }).optional(),
  expiryDate: z.date().optional(),
  isActive: z.boolean().default(true)
});

export const insertMessageSchema = z.object({
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  isRead: z.boolean().default(false)
});

export const insertOrderSchema = z.object({
  customerId: z.string(),
  cropId: z.string(),
  quantity: z.number(),
  totalPrice: z.number(),
  status: z.string().default('pending'),
  paymentIntentId: z.string().optional()
});

export const insertReviewSchema = z.object({
  customerId: z.string(),
  farmerId: z.string(),
  cropId: z.string(),
  rating: z.number(),
  comment: z.string().optional()
});

export const insertUpcomingCropSchema = z.object({
  farmerId: z.string(),
  name: z.string(),
  plantedDate: z.date().optional(),
  yieldTime: z.object({
    years: z.number().optional(),
    months: z.number().optional(),
    days: z.number().optional()
  }).optional(),
  photoUrl: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional()
  }).optional()
});

export const insertDeliveryRequestSchema = z.object({
  customerId: z.string(),
  farmerId: z.string(),
  cropId: z.string(),
  quantity: z.number(),
  proposedDeliveryPrice: z.number().optional(),
  status: z.string().default('requested')
});

export const insertMarketPriceSchema = z.object({
  commodity: z.string(),
  category: z.string(),
  price: z.number(),
  unit: z.string().default('kg'),
  market: z.string(),
  state: z.string(),
  district: z.string(),
  date: z.string(),
  minPrice: z.number(),
  maxPrice: z.number(),
  yesterdayPrice: z.number(),
  trend: z.enum(['up', 'down', 'stable']).default('stable')
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertCrop = z.infer<typeof insertCropSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertUpcomingCrop = z.infer<typeof insertUpcomingCropSchema>;
export type InsertDeliveryRequest = z.infer<typeof insertDeliveryRequestSchema>;
export type InsertMarketPrice = z.infer<typeof insertMarketPriceSchema>;
