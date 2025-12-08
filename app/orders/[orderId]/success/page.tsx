'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Spinner } from '@/components/ui/spinner';
import { Check, Copy, Home, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import type { OrderResponse } from '@/src/lib/api/models/pos';

/**
 * Order Success Page
 * Displays confirmation after successful order creation
 */
export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Simulate fetching order details
    // In real scenario, you would fetch from API using orderId
    setIsLoading(false);

    // Mock order data
    setOrderData({
      id: orderId,
      order_status: 'CREATED',
      payment_status: 'PENDING',
    });
  }, [orderId]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast({
      description: 'Đã sao chép mã đơn hàng',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-12">
      <Container className="max-w-lg">
        {/* Success Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo Đơn Hàng Thành Công!</h1>
          <p className="text-gray-600">
            Đơn hàng của bạn đã được tạo và đang chờ xử lý
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-8 border-2 border-green-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle>Chi Tiết Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Order ID */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Mã Đơn Hàng</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 p-3 rounded font-mono text-sm break-all">
                  {orderId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyOrderId}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border-t pt-6" />

            {/* Status Information */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Trạng Thái Đơn</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="font-semibold text-gray-900">
                    {orderData?.order_status === 'CREATED' ? 'Vừa Tạo' : 'Đang Xử Lý'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Trạng Thái Thanh Toán</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="font-semibold text-gray-900">
                    {orderData?.payment_status === 'PENDING' ? 'Chưa Thanh Toán' : 'Đã Thanh Toán'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>⏳ Lưu ý:</strong> Vui lòng hoàn thành thanh toán bằng cách quét mã QR hoặc
                thanh toán tiền mặt khi giao hàng.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/')}
            size="lg"
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo Đơn Hàng Khác
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="lg"
            className="w-full gap-2"
          >
            <Home className="h-4 w-4" />
            Quay Về Trang Chủ
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center text-sm text-blue-800">
          <p>
            Có câu hỏi? Liên hệ với chúng tôi hoặc kiểm tra trạng thái đơn hàng bất kỳ lúc nào.
          </p>
        </div>
      </Container>
    </div>
  );
}
