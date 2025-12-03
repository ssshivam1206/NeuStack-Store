'use client';

import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function AnalyticsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: AnalyticsCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <div className="p-2 bg-primary-50 rounded-lg">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
      </div>
      <div className="mb-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      {description && (
        <p
          className={`text-sm ${trend ? trendColors[trend] : 'text-gray-500'}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
