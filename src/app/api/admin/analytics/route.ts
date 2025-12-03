import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ApiResponse } from '@/types';

interface AnalyticsData {
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  discountCodesIssued: Array<{
    code: string;
    discountPercent: number;
    isUsed: boolean;
    createdAt: Date;
    usedAt?: Date;
    orderId?: string;
  }>;
  totalDiscountAmount: number;
  orderCount: number;
  nthOrderConfig: number;
}

/**
 * GET /api/admin/analytics
 * Returns store analytics:
 * - Total items purchased count
 * - Total purchase amount
 * - List of discount codes issued
 * - Total discount amount given
 */
export async function GET(): Promise<NextResponse<ApiResponse<AnalyticsData>>> {
  try {
    const analytics = store.getAnalytics();

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
}
