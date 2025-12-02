'use client';

import { Product } from '../../types';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { ShoppingCart, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      {/* Product Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <Package className="h-16 w-16 text-gray-400" />
      </div>

      <CardContent className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
            {product.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            ${product.price.toFixed(2)}
          </span>
          <span
            className={`text-sm ${
              product.stock > 10 ? 'text-green-600' : 'text-orange-600'
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
