'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamOrdersList } from '@/src/lib/hooks/useTeamOrders';

const PAGE_SIZE = 20;

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

export default function TeamOrdersPage() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [q, setQ] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined);
    const [fulfillmentType, setFulfillmentType] = useState<string | undefined>(undefined);

    const listQuery = useTeamOrdersList({
        page,
        limit: PAGE_SIZE,
        q: q || undefined,
        paymentStatus: paymentStatus || undefined,
        fulfillmentType: fulfillmentType || undefined,
    });

    const orders = listQuery.data?.data ?? [];
    const total = listQuery.data?.total ?? 0;
    const limit = listQuery.data?.limit ?? PAGE_SIZE;
    const hasNextPage = page * limit < total;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team Orders</h1>
                    <p className="text-muted-foreground text-sm">View and manage incoming orders.</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <input
                    placeholder="Search code, name, phone..."
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setPage(1);
                    }}
                    className="border rounded-md px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-black"
                />

                <select
                    value={paymentStatus ?? ''}
                    onChange={(e) => {
                        const value = e.target.value || undefined;
                        setPaymentStatus(value);
                        setPage(1);
                    }}
                    className="border rounded-md px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-black"
                >
                    <option value="">All Payment Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                </select>

                <select
                    value={fulfillmentType ?? ''}
                    onChange={(e) => {
                        const value = e.target.value || undefined;
                        setFulfillmentType(value);
                        setPage(1);
                    }}
                    className="border rounded-md px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-black"
                >
                    <option value="">All Fulfillment Types</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="PICKUP_SCHOOL">Pickup at School</option>
                </select>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                {listQuery.isError ? (
                    <div className="p-8 text-center text-red-500">Failed to load orders. Please try again.</div>
                ) : listQuery.isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading orders...</div>
                ) : (
                    <>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b font-medium text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Referral</th>
                                    <th className="px-4 py-3">Note</th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Created At</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                                {orders.map((order) => (
                                    <tr
                                        key={order.code}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/team/orders/${order.code}`)}
                                    >
                                        <td className="px-4 py-3 text-gray-900 font-mono text-xs">{order.code}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{order.full_name}</div>
                                            <div className="text-gray-500 text-xs">{order.phone}</div>
                                        </td>
                                        <td className="px-4 py-3">
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
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 uppercase">
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                                            {order.referral_code ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                                            {order.note ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {formatCurrency(order.grand_total_vnd)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {formatDateTime(order.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-blue-600 hover:underline font-medium text-xs">View</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                            <div className="text-xs text-gray-500">Page {page}</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPage((p) => Math.max(1, p - 1));
                                    }}
                                    disabled={page <= 1}
                                    className="px-3 py-1 border rounded bg-white text-xs disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPage((p) => p + 1);
                                    }}
                                    disabled={!hasNextPage}
                                    className="px-3 py-1 border rounded bg-white text-xs disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
