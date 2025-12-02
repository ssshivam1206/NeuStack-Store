'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { Order } from '@/types';

export default function CartPage() {
  const { cart, isLoading, fetchCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleCheckout = async (discountCode?: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountCode }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setCompletedOrder(data.data);
        toast.success('Order placed successfully');
        await fetchCart(); // Refresh cart (will be empty)
      } else {
        toast.error(data.error || 'Checkout failed');
      }
    } catch (error) {
      toast.error('Failed to process checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  // Order Success View
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mb-6">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Confirmed
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your order ID is:
        </p>
        <p className="font-mono text-lg bg-gray-100 py-2 px-4 rounded inline-block mb-8">
          {completedOrder.id}
        </p>

        <div className="bg-white rounded-xl shadow-md p-6 text-left mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {completedOrder.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-gray-600"
              >
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span>
                  ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${completedOrder.subtotal.toFixed(2)}</span>
            </div>
            {completedOrder.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({completedOrder.discountCode})</span>
                <span>-${completedOrder.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${completedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Link href="/">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  // Empty Cart View
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h1>
        <p className="text-gray-600 mb-8">
          Looks like you have not added anything to your cart yet.
        </p>
        <Link href="/">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  // Cart View
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your
          cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            {cart.items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>

          <Link
            href="/"
            className="inline-flex items-center mt-4 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <CartSummary
            onCheckout={handleCheckout}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
