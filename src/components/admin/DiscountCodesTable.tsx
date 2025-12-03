'use client';

import { DiscountCode } from '@/types';
import { CheckCircle, XCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface DiscountCodesTableProps {
  codes: DiscountCode[];
}

export default function DiscountCodesTable({ codes }: DiscountCodesTableProps) {
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  if (codes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No discount codes have been issued yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">
              Code
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">
              Discount
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">
              Status
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">
              Created
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">
              Used
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {codes.map((code) => (
            <tr
              key={code.code}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3 px-4">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {code.code}
                </code>
              </td>
              <td className="py-3 px-4">{code.discountPercent}%</td>
              <td className="py-3 px-4">
                {code.isUsed ? (
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <XCircle className="h-4 w-4" />
                    Used
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Available
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {new Date(code.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {code.usedAt ? new Date(code.usedAt).toLocaleDateString() : '-'}
              </td>
              <td className="py-3 px-4">
                {!code.isUsed && (
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
