import { ObjectId } from 'mongodb'

// User Model
export interface User {
  _id?: ObjectId
  email: string
  password?: string
  name: string
  role: 'admin' | 'manager' | 'chef'
  restaurantId?: ObjectId
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Restaurant Model
export interface Restaurant {
  _id?: ObjectId
  name: string
  address: string
  phone: string
  email: string
  tables: number
  operatingHours: {
    open: string
    close: string
  }
  createdAt: Date
  updatedAt: Date
}

// Menu Item Model
export interface MenuItem {
  _id?: ObjectId
  restaurantId: ObjectId
  name: string
  category: string
  description: string
  price: number
  preparationTime: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Order Model
export interface Order {
  _id?: ObjectId
  restaurantId: ObjectId
  orderId: string
  tableNumber: number
  items: OrderItem[]
  status: 'pending' | 'confirmed' | 'cooking' | 'ready' | 'served' | 'completed'
  totalPrice: number
  specialInstructions?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  preparationStartedAt?: Date
  readyAt?: Date
}

// Order Item Model
export interface OrderItem {
  menuItemId: ObjectId
  name: string
  quantity: number
  price: number
  status: 'pending' | 'cooking' | 'ready' | 'served'
  specialInstructions?: string
  prepStartedAt?: Date
  readyAt?: Date
}

// Kitchen Item Model
export interface KitchenItem {
  _id?: ObjectId
  orderId: ObjectId
  restaurantId: ObjectId
  itemName: string
  quantity: number
  specialInstructions?: string
  status: 'pending' | 'cooking' | 'ready'
  createdAt: Date
  prepStartedAt?: Date
  readyAt?: Date
  tableNumber: number
}

// Analytics Model
export interface DailyAnalytics {
  _id?: ObjectId
  restaurantId: ObjectId
  date: Date
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  peakHours: { hour: number; orders: number }[]
  mostOrderedItems: { itemName: string; quantity: number }[]
  createdAt: Date
}

// Session Model
export interface Session {
  _id?: ObjectId
  sessionToken: string
  userId: ObjectId
  expires: Date
  createdAt: Date
}
