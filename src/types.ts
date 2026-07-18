export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  unit: string;
  stock: number;
  image: string; // URL or Base64 string
  description?: string;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryType: 'delivery' | 'pickup';
  items: OrderItem[];
  totalAmount: number;
  savings: number;
  status: 'Pending' | 'Accepted' | 'Packed' | 'Out for Delivery' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export const CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery & Bread',
  'Pantry & Staples',
  'Beverages',
  'Snacks & Sweets',
  'Household Supplies',
  'Personal Care',
  'Pet Care',
  'Toys & Games',
  'Apparel & Innerwear'
] as const;

export type CategoryType = typeof CATEGORIES[number];

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  city: string;
  pincode: string;
  isVerified: boolean;
  createdAt: string;
}

