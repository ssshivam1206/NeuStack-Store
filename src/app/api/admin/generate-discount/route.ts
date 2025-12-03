import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ApiResponse, DiscountCode } from '@/types';

/**
 * POST /api/admin/generate-discount
 * Admin endpoint to generate a discount code
 * Will only succeed if nth order threshold has been reached
 */
export async function POST(): Promise<NextResponse<ApiResponse<DiscountCode>>> {
  try {
    const result = store.adminGenerateDiscountCode();

    if ('error' in result) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate discount code',
      },
      { status: 500 }
    );
  }
}
