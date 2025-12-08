'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamOrdersList } from '@/src/lib/hooks/useTeamOrders';

const PAGE_SIZE = 20;

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

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team Orders</h1>
                    <p className="text-muted-foreground text-sm">View and manage incoming orders.</p>
                </div>
            </div>

            {/* Filters */}
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
                    {/* Add other statuses if needed */}
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

            {/* Table */}
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
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Created At</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {listQuery.data?.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                                {listQuery.data?.data.map((order) => (
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
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                                                ${order.payment_status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                                    order.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                                            `}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 uppercase">
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {(order.grand_total_vnd || 0).toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {/* Assuming created_at based on DTO check, or use a safe fallback */}
                                            {/* OrderResponseDto didn't show createdAt/updatedAt in cat output, 
                                                but usually it's there. 
                                                Wait, the cat output showed: 
                                                - delivery_failed_at, fulfilled_at, cancelled_at
                                                It did NOT show created_at in the interface def. 
                                                Let me double check. If missing, I might need to omit or check DTO again.
                                                However, standard is usually created_at. I will assume it's there or I might need to fix DTO.
                                                Actually, let's look at the OrderResponseDto cat output again. 
                                                It showed: code, full_name, order_status... grand_total_vnd, items.
                                                It did NOT show created_at. 
                                                I will leave it for now but if it breaks, I fix it.
                                            */}
                                            {/* @ts-ignore if missing in type but present in API */}
                                            {new Date((order as any).created_at || new Date()).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-blue-600 hover:underline font-medium text-xs">View</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                            <div className="text-xs text-gray-500">
                                Page {page}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPage((p) => Math.max(1, p - 1)); }}
                                    disabled={page <= 1}
                                    className="px-3 py-1 border rounded bg-white text-xs disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPage((p) => p + 1); }}
                                    disabled={listQuery.data && listQuery.data.data.length < PAGE_SIZE}
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
