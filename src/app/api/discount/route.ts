import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ApiResponse, DiscountCode } from '@/types';

/**
 * GET /api/discount
 * Check if there's an available discount code for the customer
 * Customers can request this - it will only return a code if one is available
 */
export async function GET(): Promise<
  NextResponse<ApiResponse<DiscountCode | null>>
> {
  try {
    const availableCode = store.getAvailableDiscountCode();

    return NextResponse.json({
      success: true,
      data: availableCode,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check for discount code',
      },
      { status: 500 }
    );
  }
}
