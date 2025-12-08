'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useTeamOrdersList } from '@/src/lib/hooks/useTeamOrders';
import { useTeamStats } from '@/src/lib/hooks/useTeamStats';
import { getStatsRangeDates, type StatsRange } from '@/src/lib/utils/stats-range';

const PAGE_SIZE = 20;
const RANGE_OPTIONS: { value: StatsRange; label: string }[] = [
    { value: '7d', label: '7 ngày gần đây' },
    { value: '30d', label: '30 ngày gần đây' },
];

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
    const [range, setRange] = useState<StatsRange>('7d');

    const listQuery = useTeamOrdersList({
        page,
        limit: PAGE_SIZE,
        q: q || undefined,
        paymentStatus: paymentStatus || undefined,
        fulfillmentType: fulfillmentType || undefined,
    });

    const rangeWindow = useMemo(() => getStatsRangeDates(range), [range]);
    const statsQuery = useTeamStats(rangeWindow);

    const orders = listQuery.data?.data ?? [];
    const total = listQuery.data?.total ?? 0;
    const limit = listQuery.data?.limit ?? PAGE_SIZE;
    const hasNextPage = page * limit < total;
    const statsLoading = statsQuery.isLoading || statsQuery.isFetching;
    const timelineData = statsQuery.timeline;
    const shipmentSummary = statsQuery.shipments;
    const overview = statsQuery.overview;
    const successRateValue = Number.isFinite(overview.successRate) ? overview.successRate : 0;
    const statsCards = [
        {
            label: 'Tổng số đơn',
            value: overview.totalOrders.toLocaleString('vi-VN'),
        },
        {
            label: 'Tổng doanh thu',
            value: formatCurrency(overview.totalRevenue),
        },
        {
            label: 'Đơn hoàn tất',
            value: overview.completedOrders.toLocaleString('vi-VN'),
        },
        {
            label: 'Đơn đang xử lý',
            value: overview.pendingOrders.toLocaleString('vi-VN'),
        },
        {
            label: 'Tỉ lệ thành công',
            value: `${successRateValue.toFixed(1)}%`,
        },
        {
            label: 'Giá trị trung bình',
            value: formatCurrency(Math.round(overview.averageOrderValue)),
        },
    ];
    const shipmentEntries = [
        { label: 'Tổng chuyến', value: shipmentSummary.total },
        { label: 'Đang giao', value: shipmentSummary.inProgress },
        { label: 'Đang chờ xử lý', value: shipmentSummary.pending },
        { label: 'Đã giao thành công', value: shipmentSummary.delivered },
        { label: 'Thất bại', value: shipmentSummary.failed },
    ];

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team Orders</h1>
                    <p className="text-muted-foreground text-sm">View and manage incoming orders.</p>
                </div>
            </div>

            <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Hiệu suất của đội</h2>
                        <p className="text-sm text-gray-500">Theo dõi đơn hàng và giao nhận theo khoảng thời gian.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {RANGE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setRange(option.value)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                                    range === option.value
                                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {statsCards.map((card) => (
                        <TeamStatCard key={card.label} label={card.label} value={card.value} loading={statsLoading} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Đơn & doanh thu theo ngày</h3>
                            <p className="text-sm text-gray-500">Hiển thị đơn hàng và doanh thu hàng ngày.</p>
                        </div>
                    </div>
                    {statsLoading ? (
                        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">Đang tải dữ liệu...</div>
                    ) : timelineData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                            Không có dữ liệu trong khoảng thời gian này.
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                                        stroke="#6b7280"
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#6b7280"
                                        width={48}
                                        tickFormatter={(value) => Number(value).toLocaleString('vi-VN')}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#6b7280"
                                        width={64}
                                        tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                                    />
                                    <Tooltip
                                        labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                                        formatter={(value, name) => {
                                            if (name === 'orders') {
                                                return [`${Number(value).toLocaleString('vi-VN')} đơn`, 'Đơn hàng'];
                                            }
                                            return [formatCurrency(Number(value)), 'Doanh thu'];
                                        }}
                                    />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="orders"
                                        fill="#22c55e"
                                        radius={[4, 4, 0, 0]}
                                        opacity={0.85}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#0ea5e9"
                                        strokeWidth={2}
                                        dot={{ r: 2, fill: '#0ea5e9' }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Trạng thái giao nhận</h3>
                            <p className="text-sm text-gray-500">Tổng quan tình trạng các chuyến giao hàng.</p>
                        </div>
                    </div>
                    {statsLoading ? (
                        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">Đang tải dữ liệu...</div>
                    ) : (
                        <div className="space-y-4">
                            {shipmentEntries.map((entry) => (
                                <div key={entry.label} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{entry.label}</p>
                                    </div>
                                    <p className="text-base font-semibold text-gray-900">
                                        {entry.value.toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
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
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${
                                                    order.payment_status === 'SUCCESS'
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.payment_status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
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

function TeamStatCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
    return (
        <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
            {loading ? (
                <div className="mt-3 h-6 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
                <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            )}
        </div>
    );
}
