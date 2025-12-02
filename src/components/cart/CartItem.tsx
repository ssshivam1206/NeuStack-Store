'use client';

import { CartItem as CartItemType } from '@/types';
import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart, isLoading } = useCart();

  const handleIncrement = async () => {
    const success = await updateQuantity(item.productId, item.quantity + 1);
    if (!success) {
      toast.error('Failed to update quantity');
    }
  };

  const handleDecrement = async () => {
    if (item.quantity <= 1) {
      handleRemove();
      return;
    }
    const success = await updateQuantity(item.productId, item.quantity - 1);
    if (!success) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async () => {
    const success = await removeFromCart(item.productId);
    if (success) {
      toast.success(`${item.product.name} removed from cart`);
    } else {
      toast.error('Failed to remove item');
    }
  };

  const itemTotal = item.product.price * item.quantity;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200 last:border-b-0">
      {/* Product Image Placeholder */}
      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Package className="h-8 w-8 text-gray-400" />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {item.product.name}
        </h3>
        <p className="text-sm text-gray-500">
          ${item.product.price.toFixed(2)} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={isLoading}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4 text-gray-600" />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={handleIncrement}
          disabled={isLoading}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Item Total */}
      <div className="w-24 text-right">
        <span className="font-semibold text-gray-900">
          ${itemTotal.toFixed(2)}
        </span>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isLoading}
        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
        aria-label="Remove item"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}
