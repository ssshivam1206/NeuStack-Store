import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ApiResponse, Order } from '@/types';

// Disable caching for checkout route
export const dynamic = 'force-dynamic';

/**
 * POST /api/checkout
 * Process checkout with optional discount code
 * Body: { discountCode?: string }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const cartId = request.cookies.get('cartId')?.value;

    console.log('[Checkout] cartId from cookie:', cartId);
    console.log(
      '[Checkout] cart exists in store:',
      cartId ? store.hasCart(cartId) : false
    );

    if (!cartId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No cart found. Please add items to your cart first.',
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { discountCode } = body;

    const result = store.checkout(cartId, discountCode);
    console.log('[Checkout] result:', result);

    if ('error' in result) {
      const response = NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );

      // If cart not found (e.g., server restarted), clear the stale cookie
      if (result.error.includes('Cart not found')) {
        response.cookies.delete('cartId');
      }

      return response;
    }

    // Clear cart cookie after successful checkout
    const response = NextResponse.json({
      success: true,
      data: result,
    });

    response.cookies.delete('cartId');

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process checkout',
      },
      { status: 500 }
    );
  }
}
