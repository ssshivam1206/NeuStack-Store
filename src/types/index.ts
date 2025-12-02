// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  createdAt: Date;
}

// Discount Code Types
export interface DiscountCode {
  code: string;
  discountPercent: number;
  isUsed: boolean;
  createdAt: Date;
  usedAt?: Date;
  orderId?: string;
}

// Analytics Types
export interface Analytics {
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  discountCodesIssued: DiscountCode[];
  totalDiscountAmount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Store Configuration
export interface StoreConfig {
  nthOrderForDiscount: number; // Every nth order gets a discount
  discountPercent: number; // Discount percentage (e.g., 10 for 10%)
}
