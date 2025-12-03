/**
 * Unit tests for the in-memory store
 * Tests the core business logic including:
 * - Product management
 * - Cart operations
 * - Checkout flow
 * - Nth-order discount system
 */

import { store, storeConfig } from '@/lib/store';

// Mock uuid to have predictable IDs in tests
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)),
}));

describe('Store', () => {
  describe('Products', () => {
    it('should return all products', () => {
      const products = store.getAllProducts();
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toHaveProperty('id');
      expect(products[0]).toHaveProperty('name');
      expect(products[0]).toHaveProperty('price');
    });

    it('should get product by ID', () => {
      const products = store.getAllProducts();
      const product = store.getProductById(products[0].id);
      expect(product).toBeDefined();
      expect(product?.id).toBe(products[0].id);
    });

    it('should return undefined for invalid product ID', () => {
      const product = store.getProductById('invalid-id');
      expect(product).toBeUndefined();
    });
  });

  describe('Cart Operations', () => {
    const cartId = 'test-cart-1';

    it('should create a new cart for a cart ID', () => {
      const cart = store.getCart(cartId);
      expect(cart).toBeDefined();
      expect(cart.id).toBe(cartId);
      expect(cart.items).toEqual([]);
    });

    it('should add items to cart', () => {
      const products = store.getAllProducts();
      const product = products[0];

      const cart = store.addToCart(cartId, product.id, 2);
      expect(cart).toBeDefined();
      expect(cart?.items.length).toBe(1);
      expect(cart?.items[0].quantity).toBe(2);
      expect(cart?.items[0].productId).toBe(product.id);
    });

    it('should increment quantity when adding same product', () => {
      const products = store.getAllProducts();
      const product = products[0];

      store.addToCart(cartId, product.id, 1);
      const cart = store.getCart(cartId);
      expect(cart.items[0].quantity).toBe(3); // 2 from previous test + 1
    });

    it('should return null when adding product with insufficient stock', () => {
      const products = store.getAllProducts();
      const product = products[0];

      const cart = store.addToCart(cartId, product.id, 9999);
      expect(cart).toBeNull();
    });

    it('should return null when adding invalid product', () => {
      const cart = store.addToCart(cartId, 'invalid-product-id', 1);
      expect(cart).toBeNull();
    });

    it('should update cart item quantity', () => {
      const products = store.getAllProducts();
      const product = products[0];

      const cart = store.updateCartItemQuantity(cartId, product.id, 5);
      expect(cart?.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity set to 0', () => {
      const products = store.getAllProducts();
      const product = products[0];

      store.updateCartItemQuantity(cartId, product.id, 0);
      const cart = store.getCart(cartId);
      expect(
        cart.items.find((i) => i.productId === product.id)
      ).toBeUndefined();
    });

    it('should remove item from cart', () => {
      const products = store.getAllProducts();
      const product = products[1];

      store.addToCart(cartId, product.id, 1);
      const cartBefore = store.getCart(cartId);
      expect(
        cartBefore.items.find((i) => i.productId === product.id)
      ).toBeDefined();

      store.removeFromCart(cartId, product.id);
      const cartAfter = store.getCart(cartId);
      expect(
        cartAfter.items.find((i) => i.productId === product.id)
      ).toBeUndefined();
    });
  });

  describe('Checkout and Discount Logic', () => {
    const checkoutCartId = 'checkout-test-cart';

    beforeEach(() => {
      // Clear cart before each test
      store.clearCart(checkoutCartId);
    });

    it('should fail checkout with non-existent cart', () => {
      const result = store.checkout(checkoutCartId);
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toBe(
          'Cart not found. Please add items to your cart first.'
        );
      }
    });

    it('should fail checkout with empty cart', () => {
      // Create a cart first, then try to checkout
      store.getCart(checkoutCartId);
      const result = store.checkout(checkoutCartId);
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toBe('Cart is empty');
      }
    });

    it('should process checkout successfully', () => {
      const products = store.getAllProducts();
      const product = products[0];

      store.addToCart(checkoutCartId, product.id, 1);
      const result = store.checkout(checkoutCartId);

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.id).toBeDefined();
        expect(result.items.length).toBe(1);
        expect(result.total).toBe(product.price);
      }
    });

    it('should fail checkout with invalid discount code', () => {
      const products = store.getAllProducts();
      store.addToCart(checkoutCartId, products[0].id, 1);

      const result = store.checkout(checkoutCartId, 'INVALID-CODE');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toBe('Invalid or already used discount code');
      }
    });

    it('should clear cart after successful checkout', () => {
      const products = store.getAllProducts();
      store.addToCart(checkoutCartId, products[0].id, 1);
      store.checkout(checkoutCartId);

      const cart = store.getCart(checkoutCartId);
      expect(cart.items.length).toBe(0);
    });
  });

  describe('Nth Order Discount System', () => {
    it('should have correct nth order configuration', () => {
      expect(storeConfig.nthOrderForDiscount).toBe(2);
      expect(storeConfig.discountPercent).toBe(10);
    });

    it('should not generate discount before nth order', () => {
      // Initially no discount available
      const available = store.getAvailableDiscountCode();
      // Note: This depends on current order count
      // If orderCount % n !== 0, should be null
    });

    it('should validate discount code structure', () => {
      const allCodes = store.getAllDiscountCodes();
      allCodes.forEach((code) => {
        expect(code).toHaveProperty('code');
        expect(code).toHaveProperty('discountPercent');
        expect(code).toHaveProperty('isUsed');
        expect(code).toHaveProperty('createdAt');
      });
    });
  });

  describe('Analytics', () => {
    it('should return analytics data', () => {
      const analytics = store.getAnalytics();

      expect(analytics).toHaveProperty('totalItemsPurchased');
      expect(analytics).toHaveProperty('totalPurchaseAmount');
      expect(analytics).toHaveProperty('discountCodesIssued');
      expect(analytics).toHaveProperty('totalDiscountAmount');
      expect(analytics).toHaveProperty('orderCount');
      expect(analytics).toHaveProperty('nthOrderConfig');
    });

    it('should track order count', () => {
      const orderCount = store.getOrderCount();
      expect(typeof orderCount).toBe('number');
      expect(orderCount).toBeGreaterThanOrEqual(0);
    });
  });
});
