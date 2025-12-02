'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Tag, Percent, CheckCircle } from 'lucide-react';
import { DiscountCode } from '@/types';

interface CartSummaryProps {
  onCheckout: (discountCode?: string) => Promise<void>;
  isProcessing: boolean;
}

export default function CartSummary({
  onCheckout,
  isProcessing,
}: CartSummaryProps) {
  const { cartTotal } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [availableDiscount, setAvailableDiscount] =
    useState<DiscountCode | null>(null);
  const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);

  // Check for available discount codes
  useEffect(() => {
    async function checkForDiscount() {
      try {
        const response = await fetch('/api/discount', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success && data.data) {
          setAvailableDiscount(data.data);
        }
      } catch (error) {
        console.error('Failed to check for discount:', error);
      }
    }
    checkForDiscount();
  }, []);

  const applyAvailableDiscount = () => {
    if (availableDiscount) {
      setDiscountCode(availableDiscount.code);
    }
  };

  const discountAmount =
    discountCode && availableDiscount?.code === discountCode
      ? (cartTotal * availableDiscount.discountPercent) / 100
      : 0;

  const finalTotal = cartTotal - discountAmount;

  const handleCheckout = () => {
    onCheckout(discountCode || undefined);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* Available Discount Alert */}
      {availableDiscount && !availableDiscount.isUsed && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">
              Discount Available
            </span>
          </div>
          <p className="text-sm text-green-700 mb-2">
            A {availableDiscount.discountPercent}% discount code is available
            for you
          </p>
          <button
            onClick={applyAvailableDiscount}
            className="text-sm font-medium text-green-600 hover:text-green-800 underline"
          >
            Apply: {availableDiscount.code}
          </button>
        </div>
      )}

      {/* Discount Code Input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Enter discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!discountCode}
            onClick={() => {}}
          >
            <Tag className="h-4 w-4" />
          </Button>
        </div>
        {discountCode && discountAmount > 0 && (
          <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Discount applied: -${discountAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({availableDiscount?.discountPercent}%)</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
          <span>Total</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        isLoading={isProcessing}
        className="w-full mt-6"
        size="lg"
      >
        Proceed to Checkout
      </Button>
    </div>
  );
}
