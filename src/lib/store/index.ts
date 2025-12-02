import { Product, Cart, Order, DiscountCode, StoreConfig } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Store Configuration - Every 2nd order gets a discount
export const storeConfig: StoreConfig = {
  nthOrderForDiscount: 2,
  discountPercent: 10,
};

// In-memory data stores
class InMemoryStore {
  // Products catalog
  private products: Map<string, Product> = new Map();

  // Shopping carts (keyed by session/user ID)
  private carts: Map<string, Cart> = new Map();

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
      (item: Cart['items'][number]) => item.productId === productId
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

    const item = cart.items.find(
      (item: Cart['items'][number]) => item.productId === productId
    );
    if (!item) return null;

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item: Cart['items'][number]) => item.productId !== productId
      );
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

    cart.items = cart.items.filter(
      (item: Cart['items'][number]) => item.productId !== productId
    );
    cart.updatedAt = new Date();
    return cart;
  }

  clearCart(cartId: string): void {
    this.carts.delete(cartId);
  }
}

// Export singleton instance
export const store = new InMemoryStore();
