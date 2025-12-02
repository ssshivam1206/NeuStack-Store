'use client';

import Link from 'next/link';
import { ShoppingCart, Package, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">NeuStack</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              href="/admin"
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin</span>
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
