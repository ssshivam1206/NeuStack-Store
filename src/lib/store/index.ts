import { Product, Cart, Order, DiscountCode, StoreConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Store Configuration - Every 2nd order gets a discount
export const storeConfig: StoreConfig = {
  nthOrderForDiscount: 2,
  discountPercent: 10,
};

// In-memory data stores
const CODE_LENGTH = 7;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateDiscountString(length = CODE_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

class InMemoryStore {
  // Products catalog
  private products: Map<string, Product> = new Map();

  // Shopping carts (keyed by session/user ID)
  private carts: Map<string, Cart> = new Map();

  // Completed orders
  private orders: Order[] = [];

  // Discount codes
  private discountCodes: Map<string, DiscountCode> = new Map();

  // Global order counter for nth-order discount logic
  private orderCounter: number = 0;

  // Available discount code (generated after every nth order)
  private availableDiscountCode: string | null = null;

  constructor() {
    this.initializeProducts();
  }

  // Initialize with sample products
  private initializeProducts(): void {
    const sampleProducts: Product[] = [
      {
        id: uuidv4(),
        name: 'Wireless Bluetooth Headphones',
        description:
          'Premium noise-canceling headphones with 30-hour battery life',
        price: 149.99,
        image: '/products/headphones.jpg',
        category: 'Electronics',
        stock: 50,
      },
      {
        id: uuidv4(),
        name: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with Cherry MX switches',
        price: 129.99,
        image: '/products/keyboard.jpg',
        category: 'Electronics',
        stock: 30,
      },
      {
        id: uuidv4(),
        name: 'Ergonomic Mouse',
        description: 'Wireless ergonomic mouse with adjustable DPI',
        price: 59.99,
        image: '/products/mouse.jpg',
        category: 'Electronics',
        stock: 100,
      },
      {
        id: uuidv4(),
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
        price: 49.99,
        image: '/products/hub.jpg',
        category: 'Electronics',
        stock: 75,
      },
      {
        id: uuidv4(),
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand for better ergonomics',
        price: 39.99,
        image: '/products/stand.jpg',
        category: 'Accessories',
        stock: 60,
      },
      {
        id: uuidv4(),
        name: 'Webcam HD 1080p',
        description: 'Full HD webcam with built-in microphone and auto-focus',
        price: 79.99,
        image: '/products/webcam.jpg',
        category: 'Electronics',
        stock: 40,
      },
    ];

    sampleProducts.forEach((product) => {
      this.products.set(product.id, product);
    });
  }

  // ============ PRODUCT METHODS ============
  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  // ============ CART METHODS ============

  // Check if cart exists without creating one
  hasCart(cartId: string): boolean {
    return this.carts.has(cartId);
  }

  getCart(cartId: string): Cart {
    let cart = this.carts.get(cartId);
    if (!cart) {
      cart = {
        id: cartId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.carts.set(cartId, cart);
    }
    return cart;
  }

  addToCart(cartId: string, productId: string, quantity: number): Cart | null {
    const product = this.products.get(productId);
    if (!product) return null;

    if (product.stock < quantity) return null;

    const cart = this.getCart(cartId);
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        product,
      });
    }

    cart.updatedAt = new Date();
    return cart;
  }

  updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number
  ): Cart | null {
    const cart = this.carts.get(cartId);
    if (!cart) return null;

    const item = cart.items.find((item) => item.productId === productId);
    if (!item) return null;

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.productId !== productId);
    } else {
      const product = this.products.get(productId);
      if (!product || product.stock < quantity) return null;
      item.quantity = quantity;
    }

    cart.updatedAt = new Date();
    return cart;
  }

  removeFromCart(cartId: string, productId: string): Cart | null {
    const cart = this.carts.get(cartId);
    if (!cart) return null;

    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.updatedAt = new Date();
    return cart;
  }

  clearCart(cartId: string): void {
    this.carts.delete(cartId);
  }

  // ============ DISCOUNT CODE METHODS ============
  validateDiscountCode(code: string): DiscountCode | null {
    const discountCode = this.discountCodes.get(code);
    if (!discountCode || discountCode.isUsed) return null;
    return discountCode;
  }

  useDiscountCode(code: string, orderId: string): boolean {
    const discountCode = this.discountCodes.get(code);
    if (!discountCode || discountCode.isUsed) return false;

    discountCode.isUsed = true;
    discountCode.usedAt = new Date();
    discountCode.orderId = orderId;

    // Clear available discount code if it was the one used
    if (this.availableDiscountCode === code) {
      this.availableDiscountCode = null;
    }

    return true;
  }

  generateDiscountCode(): DiscountCode | null {
    // Only generate if there's no available unused code and we're at an nth order threshold
    if (this.availableDiscountCode) {
      return this.discountCodes.get(this.availableDiscountCode) || null;
    }

    // Check if we've hit the nth order threshold
    if (
      this.orderCounter === 0 ||
      this.orderCounter % storeConfig.nthOrderForDiscount !== 0
    ) {
      return null;
    }

    // Generate new discount code
    const code = generateDiscountString();
    const discountCode: DiscountCode = {
      code,
      discountPercent: storeConfig.discountPercent,
      isUsed: false,
      createdAt: new Date(),
    };

    this.discountCodes.set(code, discountCode);
    this.availableDiscountCode = code;

    return discountCode;
  }

  getAvailableDiscountCode(): DiscountCode | null {
    if (!this.availableDiscountCode) return null;
    return this.discountCodes.get(this.availableDiscountCode) || null;
  }

  getAllDiscountCodes(): DiscountCode[] {
    return Array.from(this.discountCodes.values());
  }

  // ============ ORDER METHODS ============
  checkout(cartId: string, discountCode?: string): Order | { error: string } {
    const cart = this.carts.get(cartId);
    if (!cart) {
      return { error: 'Cart not found. Please add items to your cart first.' };
    }
    if (cart.items.length === 0) {
      return { error: 'Cart is empty' };
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = this.products.get(item.productId);
      if (!product || product.stock < item.quantity) {
        return { error: `Insufficient stock for ${item.product.name}` };
      }
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    // Apply discount if valid code provided
    let discountAmount = 0;
    let appliedDiscountCode: string | undefined;

    if (discountCode) {
      const validDiscount = this.validateDiscountCode(discountCode);
      if (validDiscount) {
        discountAmount = (subtotal * validDiscount.discountPercent) / 100;
        appliedDiscountCode = discountCode;
      } else {
        return { error: 'Invalid or already used discount code' };
      }
    }

    const total = subtotal - discountAmount;

    // Create order
    const order: Order = {
      id: uuidv4(),
      items: cart.items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      })),
      subtotal,
      discountCode: appliedDiscountCode,
      discountAmount,
      total,
      createdAt: new Date(),
    };

    // Update stock
    for (const item of cart.items) {
      const product = this.products.get(item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }

    // Mark discount code as used if applicable
    if (appliedDiscountCode) {
      this.useDiscountCode(appliedDiscountCode, order.id);
    }

    // Save order and increment counter
    this.orders.push(order);
    this.orderCounter++;

    // Clear cart
    this.clearCart(cartId);

    // Generate discount code for next eligible customer if this is an nth order
    this.generateDiscountCode();

    return order;
  }

  getAllOrders(): Order[] {
    return [...this.orders];
  }

  getOrderCount(): number {
    return this.orderCounter;
  }

  // ============ ANALYTICS METHODS ============
  getAnalytics() {
    const totalItemsPurchased = this.orders.reduce(
      (total, order) =>
        total +
        order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
      0
    );

    const totalPurchaseAmount = this.orders.reduce(
      (total, order) => total + order.total,
      0
    );

    const totalDiscountAmount = this.orders.reduce(
      (total, order) => total + order.discountAmount,
      0
    );

    return {
      totalItemsPurchased,
      totalPurchaseAmount: Math.round(totalPurchaseAmount * 100) / 100,
      discountCodesIssued: this.getAllDiscountCodes(),
      totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
      orderCount: this.orderCounter,
      nthOrderConfig: storeConfig.nthOrderForDiscount,
    };
  }

  // ============ ADMIN METHODS ============
  // Admin can manually trigger discount code generation when nth order is reached
  adminGenerateDiscountCode(): DiscountCode | { error: string } {
    // Check if conditions are met for discount generation
    if (this.orderCounter === 0) {
      return { error: 'No orders placed yet' };
    }

    if (this.orderCounter % storeConfig.nthOrderForDiscount !== 0) {
      return {
        error: `Discount can only be generated after every ${storeConfig.nthOrderForDiscount} orders. Current order count: ${this.orderCounter}`,
      };
    }

    if (this.availableDiscountCode) {
      const existingCode = this.discountCodes.get(this.availableDiscountCode);
      if (existingCode && !existingCode.isUsed) {
        return { error: 'A discount code is already available and unused' };
      }
    }

    // Generate new code
    const code = generateDiscountString();
    const discountCode: DiscountCode = {
      code,
      discountPercent: storeConfig.discountPercent,
      isUsed: false,
      createdAt: new Date(),
    };

    this.discountCodes.set(code, discountCode);
    this.availableDiscountCode = code;

    return discountCode;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __neustackStore: InMemoryStore | undefined;
}

const globalForStore = globalThis as typeof globalThis & {
  __neustackStore?: InMemoryStore;
};

const storeInstance = globalForStore.__neustackStore ?? new InMemoryStore();

globalForStore.__neustackStore = storeInstance;

// Export singleton instance that survives hot reloads
export const store = storeInstance;
