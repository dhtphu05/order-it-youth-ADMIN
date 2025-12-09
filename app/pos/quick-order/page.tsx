'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuickOrderCart, type CartItem } from '@/components/quick-order/quick-order-cart';
import { QuickOrderForm } from '@/components/quick-order/quick-order-form';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickOrderProductGrid } from '@/components/quick-order/quick-order-product-grid';

/**
 * Quick Order Page (POS - Public)
 * Allows customers to quickly create orders
 * Flow: Select Products -> Enter Customer Info -> Submit
 */
export default function QuickOrderPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleAddCartItem = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((existing) =>
        item.combo_id
          ? existing.combo_id === item.combo_id
          : existing.variant_id === item.variant_id && !existing.combo_id,
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleOrderSuccess = (orderId: string) => {
    // Navigate to success page
    router.push(`/orders/${orderId}/success`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <Container className="max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Đặt Hàng Nhanh</h1>
            <p className="text-gray-600 mt-1">
              Tạo đơn hàng mới trong vài bước đơn giản
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <QuickOrderProductGrid onAddItem={handleAddCartItem} />

          {/* Cart Section */}
          <QuickOrderCart items={cartItems} onItemsChange={setCartItems} />

          <Separator />

          {/* Order Form Section */}
          <QuickOrderForm items={cartItems} onSuccess={handleOrderSuccess} />

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Hướng Dẫn</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Thêm sản phẩm vào giỏ hàng</li>
              <li>Chọn đội bán hàng (bắt buộc)</li>
              <li>Tùy chọn: Chọn người giao hàng</li>
              <li>Nhập thông tin khách hàng (tùy chọn)</li>
              <li>Nhấp "Tạo Đơn Hàng" để hoàn thành</li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
