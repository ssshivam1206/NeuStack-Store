'use client';

import { useEffect, useState, useCallback } from 'react';
import AnalyticsCard from '@/components/admin/AnalyticsCard';
import DiscountCodesTable from '@/components/admin/DiscountCodesTable';
import Button from '@/components/ui/Button';
import {
  ShoppingCart,
  DollarSign,
  Ticket,
  Percent,
  RefreshCw,
  Plus,
  Loader2,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { DiscountCode } from '@/types';

interface AnalyticsData {
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  discountCodesIssued: DiscountCode[];
  totalDiscountAmount: number;
  orderCount: number;
  nthOrderConfig: number;
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        toast.error('Failed to fetch analytics');
      }
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleGenerateDiscount = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/admin/generate-discount', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Discount code generated: ${data.data.code}`);
        fetchAnalytics(); // Refresh data
      } else {
        toast.error(data.error || 'Failed to generate discount code');
      }
    } catch (error) {
      toast.error('Failed to generate discount code');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load analytics</p>
        <Button onClick={fetchAnalytics} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const availableCodes = analytics.discountCodesIssued.filter(
    (c) => !c.isUsed
  ).length;
  const usedCodes = analytics.discountCodesIssued.filter(
    (c) => c.isUsed
  ).length;
  const nextDiscountIn =
    analytics.nthOrderConfig -
    (analytics.orderCount % analytics.nthOrderConfig);
  const canGenerateDiscount =
    analytics.orderCount > 0 &&
    analytics.orderCount % analytics.nthOrderConfig === 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Store analytics and discount code management
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleGenerateDiscount}
            isLoading={isGenerating}
            disabled={!canGenerateDiscount}
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Discount
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-blue-800">
          <strong>Discount System:</strong> A new discount code becomes
          available every <strong>{analytics.nthOrderConfig}</strong> orders.{' '}
          {analytics.orderCount === 0 ? (
            'No orders yet.'
          ) : canGenerateDiscount ? (
            <span className="text-green-700">
              A discount code can be generated now.
            </span>
          ) : (
            `Next discount available after ${nextDiscountIn} more order${
              nextDiscountIn !== 1 ? 's' : ''
            }.`
          )}
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Orders"
          value={analytics.orderCount}
          icon={Hash}
          description={`Next discount in ${nextDiscountIn} orders`}
        />
        <AnalyticsCard
          title="Items Purchased"
          value={analytics.totalItemsPurchased}
          icon={ShoppingCart}
          description="Total items sold"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`$${analytics.totalPurchaseAmount.toFixed(2)}`}
          icon={DollarSign}
          description="After discounts"
        />
        <AnalyticsCard
          title="Total Discounts"
          value={`$${analytics.totalDiscountAmount.toFixed(2)}`}
          icon={Percent}
          description={`${usedCodes} codes used`}
        />
      </div>

      {/* Discount Codes Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Discount Codes</h2>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">{availableCodes} available</span>
            <span className="text-gray-500">{usedCodes} used</span>
          </div>
        </div>
        <DiscountCodesTable codes={analytics.discountCodesIssued} />
      </div>
    </div>
  );
}
