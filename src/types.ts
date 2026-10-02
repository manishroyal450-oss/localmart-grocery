export interface MenuItem {
  id: string;
  category: string;
  name: string;
  price?: number;
  originalPrice?: number;
  stock?: number;
  standardPrice?: string | number | null;
  halfPrice?: string | number | null;
  fullPrice?: string | number | null;
  regularPrice?: string | number | null;
  mediumPrice?: string | number | null;
  largePrice?: string | number | null;
  notes?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  offer?: string | null;
  isVeg?: boolean;
  unit?: string;
  image?: string;
  description?: string;
  isAvailable?: boolean;
  spicyLevel?: 'Mild' | 'Medium' | 'Spicy';
  prepTime?: string;
  rating?: number;
  reviewsCount?: number;
  isChefSpecial?: boolean;
}

export type PricingType = 'standard' | 'half-full' | 'sizes' | 'custom';

export interface CategoryInfo {
  name: string;
  icon: string;
  count: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  unit: string;
  stock: number;
  image: string;
  description?: string;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CafeCartItem {
  cartItemId: string;
  item: MenuItem;
  variant?: string;
  price: number;
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
  'Apparel & Innerwear',
  'Electronics'
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
  password?: string;
}

export const RESTAURANT_CATEGORIES = [
  'All Dishes',
  'Thalis & Meals',
  'Fast Food & Chinese',
  'Snacks & Chaat',
  'South Indian',
  'Beverages & Shakes',
  'Desserts & Sweets'
] as const;

export type RestaurantCategoryType = typeof RESTAURANT_CATEGORIES[number];
