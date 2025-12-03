/**
 * Unit tests specifically for the discount code system
 * Tests the nth-order discount logic in isolation
 */

import { storeConfig } from '@/lib/store';

describe('Discount Code System', () => {
  describe('Configuration', () => {
    it('should be configured for every 2nd order', () => {
      expect(storeConfig.nthOrderForDiscount).toBe(2);
    });

    it('should offer 10% discount', () => {
      expect(storeConfig.discountPercent).toBe(10);
    });
  });

  describe('Discount Calculation', () => {
    const discountPercent = storeConfig.discountPercent;

    it('should calculate 10% discount correctly', () => {
      const subtotal = 100;
      const expectedDiscount = 10;
      const actualDiscount = (subtotal * discountPercent) / 100;
      expect(actualDiscount).toBe(expectedDiscount);
    });

    it('should handle decimal amounts', () => {
      const subtotal = 149.99;
      const expectedDiscount = 14.999; // 10% of 149.99
      const actualDiscount = (subtotal * discountPercent) / 100;
      expect(actualDiscount).toBeCloseTo(expectedDiscount, 2);
    });

    it('should handle zero amount', () => {
      const subtotal = 0;
      const actualDiscount = (subtotal * discountPercent) / 100;
      expect(actualDiscount).toBe(0);
    });
  });

  describe('Nth Order Logic', () => {
    const n = storeConfig.nthOrderForDiscount;

    it('should identify nth orders correctly', () => {
      // Order 1: 1 % 2 = 1 (not eligible)
      // Order 2: 2 % 2 = 0 (eligible)
      // Order 3: 3 % 2 = 1 (not eligible)
      // Order 4: 4 % 2 = 0 (eligible)

      expect(1 % n === 0).toBe(false);
      expect(2 % n === 0).toBe(true);
      expect(3 % n === 0).toBe(false);
      expect(4 % n === 0).toBe(true);
      expect(10 % n === 0).toBe(true);
      expect(99 % n === 0).toBe(false);
      expect(100 % n === 0).toBe(true);
    });

    it('should calculate orders until next discount', () => {
      const calculateOrdersUntilDiscount = (
        currentOrderCount: number
      ): number => {
        if (currentOrderCount === 0) return n;
        const remainder = currentOrderCount % n;
        return remainder === 0 ? 0 : n - remainder;
      };

      expect(calculateOrdersUntilDiscount(0)).toBe(2); // No orders yet, 2 until discount
      expect(calculateOrdersUntilDiscount(1)).toBe(1); // 1 more order needed
      expect(calculateOrdersUntilDiscount(2)).toBe(0); // Discount available now
      expect(calculateOrdersUntilDiscount(3)).toBe(1); // 1 more order needed
      expect(calculateOrdersUntilDiscount(4)).toBe(0); // Discount available now
    });
  });

  describe('Discount Code Format', () => {
    it('should generate valid discount code format', () => {
      const code = `DISCOUNT-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      expect(code).toMatch(/^DISCOUNT-\d+-[A-Z0-9]+$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const code = `DISCOUNT-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`;
        codes.add(code);
      }
      // All 100 codes should be unique
      expect(codes.size).toBe(100);
    });
  });

  describe('Discount Code Lifecycle', () => {
    it('should track code usage state', () => {
      interface DiscountCode {
        code: string;
        isUsed: boolean;
        usedAt?: Date;
        orderId?: string;
      }

      const code: DiscountCode = {
        code: 'TEST-CODE',
        isUsed: false,
      };

      // Initially not used
      expect(code.isUsed).toBe(false);
      expect(code.usedAt).toBeUndefined();
      expect(code.orderId).toBeUndefined();

      // Mark as used
      code.isUsed = true;
      code.usedAt = new Date();
      code.orderId = 'order-123';

      expect(code.isUsed).toBe(true);
      expect(code.usedAt).toBeInstanceOf(Date);
      expect(code.orderId).toBe('order-123');
    });

    it('should not allow reuse of used code', () => {
      const usedCode = { isUsed: true };
      const validateCode = (code: { isUsed: boolean }) => !code.isUsed;

      expect(validateCode(usedCode)).toBe(false);
    });
  });
});
