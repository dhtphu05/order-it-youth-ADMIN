'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTeamOrderDetail } from '@/src/lib/hooks/useTeamOrders';
import { ArrowLeft } from 'lucide-react';

export default function TeamOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const code = params?.code as string;

    const orderQuery = useTeamOrderDetail(code);
    const order = orderQuery.data;

    if (orderQuery.isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
    }

    if (orderQuery.isError || !order) {
        return <div className="p-8 text-center text-red-500">Failed to load order.</div>;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        Order <span className="font-mono text-lg">{order.code}</span>
                    </h1>
                    <div className="text-sm text-gray-500">
                        {/* Safe check for date */}
                        {new Date((order as any).created_at || Date.now()).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Items & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-lg border shadow-sm p-4">
                        <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start py-2 border-b last:border-0">
                                    <div>
                                        <div className="font-medium text-gray-900">{item.title}</div>
                                        <div className="text-sm text-gray-500">Qty: {item.quantity} × {item.unit_price_vnd.toLocaleString('vi-VN')} đ</div>
                                    </div>
                                    <div className="font-medium">
                                        {item.line_total_vnd.toLocaleString('vi-VN')} đ
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>{order.grand_total_vnd.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Status Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg border shadow-sm p-4 text-sm space-y-3">
                        <h2 className="font-semibold text-gray-900 text-base">Customer</h2>
                        <div>
                            <div className="text-gray-500">Name</div>
                            <div className="font-medium">{order.full_name}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Phone</div>
                            <div className="font-medium">{order.phone}</div>
                        </div>
                        {/* Address/Note might not be on OrderResponseDto top level? Assuming not based on chat, but if it is I'd add it */}
                    </div>

                    {/* Status Info */}
                    <div className="bg-white rounded-lg border shadow-sm p-4 text-sm space-y-3">
                        <h2 className="font-semibold text-gray-900 text-base">Status</h2>

                        <div>
                            <div className="text-gray-500 mb-1">Payment Status</div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                                ${order.payment_status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                    order.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                            `}>
                                {order.payment_status}
                            </span>
                        </div>

                        <div>
                            <div className="text-gray-500 mb-1">Order Status</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 uppercase">
                                {order.order_status}
                            </span>
                        </div>

                        <div>
                            <div className="text-gray-500 mb-1">Fulfillment</div>
                            <span className="font-medium">
                                {order.fulfillment_type}
                            </span>
                        </div>

                        {/* Delivery Metadata */}
                        {(order.delivery_attempts > 0) && (
                            <div>
                                <div className="text-gray-500">Delivery Attempts</div>
                                <div className="font-medium">{order.delivery_attempts}</div>
                            </div>
                        )}

                        {order.fulfilled_at && (
                            <div>
                                <div className="text-gray-500">Fulfilled At</div>
                                <div className="font-medium">{new Date(order.fulfilled_at).toLocaleString()}</div>
                            </div>
                        )}

                        {order.cancelled_at && (
                            <div className="text-red-600">
                                <div>Cancelled At</div>
                                <div>{new Date(order.cancelled_at).toLocaleString()}</div>
                                {order.cancelled_reason && <div>Reason: {order.cancelled_reason}</div>}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
