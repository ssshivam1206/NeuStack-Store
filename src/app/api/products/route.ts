import { NextResponse } from 'next/server';
import { store } from '../../../lib/store';
import { ApiResponse, Product } from '../../../types';

/**
 * GET /api/products
 * Returns all available products
 */
export async function GET(): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    const products = store.getAllProducts();
    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
