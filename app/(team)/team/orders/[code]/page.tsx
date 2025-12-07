'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTeamOrderDetail } from '@/src/lib/hooks/useTeamOrders';

const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') {
        return '—';
    }
    return `${value.toLocaleString('vi-VN')} đ`;
};

const formatDateTime = (value?: string) => {
    if (!value) {
        return '—';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
};

export default function TeamOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const code = params?.code as string;

    const orderQuery = useTeamOrderDetail(code);

    if (orderQuery.isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading order...</div>;
    }

    if (orderQuery.isError || !orderQuery.data) {
        return <div className="p-8 text-center text-red-500">Failed to load order.</div>;
    }

    const order = orderQuery.data;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        Order <span className="font-mono text-lg">{order.code}</span>
                    </h1>
                    <div className="text-sm text-gray-500">{formatDateTime(order.created_at)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg border shadow-sm p-4">
                        <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div
                                    key={`${item.title}_${item.variant_id ?? ''}_${item.combo_id ?? ''}`}
                                    className="flex justify-between items-start py-2 border-b last:border-0"
                                >
                                    <div>
                                        <div className="font-medium text-gray-900">{item.title_snapshot ?? item.title}</div>
                                        <div className="text-sm text-gray-500">
                                            Qty: {item.quantity} × {formatCurrency(item.unit_price_vnd)}
                                        </div>
                                    </div>
                                    <div className="font-medium">{formatCurrency(item.line_total_vnd)}</div>
                                </div>
                            ))}
                            {order.items.length === 0 && (
                                <div className="py-6 text-center text-sm text-gray-500">No items found.</div>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(order.grand_total_vnd)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
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
                        {order.address && (
                            <div>
                                <div className="text-gray-500">Address</div>
                                <div className="font-medium">{order.address}</div>
                            </div>
                        )}
                        {order.note && (
                            <div>
                                <div className="text-gray-500">Note</div>
                                <div className="font-medium">{order.note}</div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg border shadow-sm p-4 text-sm space-y-3">
                        <h2 className="font-semibold text-gray-900 text-base">Status</h2>
                        <div>
                            <div className="text-gray-500 mb-1">Payment Status</div>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                                ${order.payment_status === 'SUCCESS'
        ? 'bg-green-100 text-green-800'
        : order.payment_status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'}
                            `}
                            >
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
                            <span className="font-medium">{order.fulfillment_type}</span>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Payment Method</div>
                            <span className="font-medium">{order.payment_method}</span>
                        </div>
                        {order.delivery_attempts > 0 && (
                            <div>
                                <div className="text-gray-500">Delivery Attempts</div>
                                <div className="font-medium">{order.delivery_attempts}</div>
                            </div>
                        )}
                        {order.fulfilled_at && (
                            <div>
                                <div className="text-gray-500">Fulfilled At</div>
                                <div className="font-medium">{formatDateTime(order.fulfilled_at)}</div>
                            </div>
                        )}
                        {order.cancelled_at && (
                            <div className="text-red-600">
                                <div>Cancelled At</div>
                                <div>{formatDateTime(order.cancelled_at)}</div>
                                {order.cancelled_reason && <div>Reason: {order.cancelled_reason}</div>}
                            </div>
                        )}
                    </div>

                    {order.shipment && (
                        <div className="bg-white rounded-lg border shadow-sm p-4 text-sm space-y-2">
                            <h2 className="font-semibold text-gray-900 text-base">Shipment</h2>
                            <div>
                                <div className="text-gray-500">Status</div>
                                <div className="font-medium">{order.shipment.status ?? '—'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Assigned</div>
                                <div className="font-medium">
                                    {order.shipment.assigned_name ?? '—'}
                                    {order.shipment.assigned_phone ? ` (${order.shipment.assigned_phone})` : ''}
                                </div>
                            </div>
                            {order.shipment.pickup_eta && (
                                <div>
                                    <div className="text-gray-500">Pickup ETA</div>
                                    <div className="font-medium">{formatDateTime(order.shipment.pickup_eta)}</div>
                                </div>
                            )}
                            {order.shipment.delivered_at && (
                                <div>
                                    <div className="text-gray-500">Delivered At</div>
                                    <div className="font-medium">{formatDateTime(order.shipment.delivered_at)}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
