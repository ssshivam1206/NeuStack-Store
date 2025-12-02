'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Cart } from '@/types';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  cartTotal: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setCart(data.data);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to add to cart:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setCart(data.data);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to update quantity:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeFromCart = useCallback(
    async (productId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setCart(data.data);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const itemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const cartTotal =
    cart?.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
