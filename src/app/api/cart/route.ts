import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ApiResponse, Cart } from '@/types';

// Disable caching for all cart routes
export const dynamic = 'force-dynamic';

// Helper to get cart ID from cookies or generate one
function getCartId(request: NextRequest): string {
  const cartId = request.cookies.get('cartId')?.value;
  return (
    cartId || `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );
}

/**
 * GET /api/cart
 * Returns the current cart contents
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Cart>>> {
  try {
    const cartId = getCartId(request);
    const cart = store.getCart(cartId);

    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    // Always set cart ID cookie to ensure consistency
    response.cookies.set('cartId', cartId, {
      httpOnly: false, // Allow JS access for debugging
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cart',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Add item to cart
 * Body: { productId: string, quantity: number }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Cart>>> {
  try {
    const existingCartId = request.cookies.get('cartId')?.value;
    const cartId = getCartId(request);

    console.log('[Cart POST] existingCartId from cookie:', existingCartId);
    console.log('[Cart POST] using cartId:', cartId);

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product ID or quantity',
        },
        { status: 400 }
      );
    }

    const cart = store.addToCart(cartId, productId, quantity);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found or insufficient stock',
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    // Always set cart ID cookie to ensure consistency
    response.cookies.set('cartId', cartId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add item to cart',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart
 * Update cart item quantity
 * Body: { productId: string, quantity: number }
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Cart>>> {
  try {
    const cartId = getCartId(request);
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product ID or quantity',
        },
        { status: 400 }
      );
    }

    const cart = store.updateCartItemQuantity(cartId, productId, quantity);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update cart item',
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    // Set cart ID cookie
    response.cookies.set('cartId', cartId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update cart',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Remove item from cart
 * Body: { productId: string }
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Cart>>> {
  try {
    const cartId = getCartId(request);
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    const cart = store.removeFromCart(cartId, productId);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to remove item from cart',
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    // Set cart ID cookie
    response.cookies.set('cartId', cartId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove item from cart',
      },
      { status: 500 }
    );
  }
}
