'use client';

import {
    useTeamStatisticsControllerGetMyTeamShipmentStats,
    useTeamStatisticsControllerGetMyTeamStats,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';

export type TeamStatsParams = {
    from: string;
    to: string;
};

type TimelinePoint = {
    date: string;
    revenue: number;
    orders: number;
};

type ShipmentSummary = {
    total: number;
    assigned: number;
    inProgress: number;
    delivered: number;
    failed: number;
    pending: number;
};

const DATA_ENVELOPE_KEYS = ['data', 'result', 'payload', 'response', 'value', 'content'] as const;
const ARRAY_ENVELOPE_KEYS = [...DATA_ENVELOPE_KEYS, 'items', 'rows', 'values', 'list'] as const;

const isRecord = (value: unknown): value is Record<string, any> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const unwrapDataObject = (value: unknown): Record<string, any> => {
    if (!isRecord(value)) {
        return {};
    }

    for (const key of DATA_ENVELOPE_KEYS) {
        if (isRecord(value[key])) {
            return unwrapDataObject(value[key]);
        }
    }

    return value;
};

const unwrapArrayValue = (value: unknown): any[] | undefined => {
    if (Array.isArray(value)) {
        return value;
    }

    if (isRecord(value)) {
        for (const key of ARRAY_ENVELOPE_KEYS) {
            const candidate = value[key];
            const unwrapped = unwrapArrayValue(candidate);
            if (unwrapped !== undefined) {
                return unwrapped;
            }
        }
    }

    return undefined;
};

const pickNumber = (...values: Array<number | string | null | undefined>) => {
    for (const value of values) {
        if (typeof value === 'number' && !Number.isNaN(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
    }
    return 0;
};

const firstString = (...values: Array<string | null | undefined>) => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }
    return undefined;
};

const pickRecord = (...values: unknown[]): Record<string, any> | undefined => {
    for (const value of values) {
        if (isRecord(value)) {
            return value;
        }
    }
    return undefined;
};

const pickArray = (...values: unknown[]): any[] | undefined => {
    for (const value of values) {
        const arr = unwrapArrayValue(value);
        if (arr !== undefined) {
            return arr;
        }
    }
    return undefined;
};

const mapRevenuePoints = (input?: any[]): TimelinePoint[] => {
    if (!Array.isArray(input)) {
        return [];
    }

    return input
        .map((item) => ({
            date:
                firstString(
                    item.date,
                    item.day,
                    item.label,
                    item.period,
                    item.timestamp,
                    item.time,
                    item.bucket,
                    item.key,
                ) ?? new Date().toISOString(),
            revenue: pickNumber(
                item.revenue,
                item.revenue_vnd,
                item.total_revenue_vnd,
                item.amount,
                item.amount_vnd,
                item.total_amount,
                item.total_amount_vnd,
                item.value,
            ),
            orders: pickNumber(
                item.orders,
                item.total_orders,
                item.count,
                item.order_count,
                item.orders_count,
                item.totalOrders,
            ),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
};

const mapOrderPoints = (input?: any[]): TimelinePoint[] => {
    if (!Array.isArray(input)) {
        return [];
    }

    return input
        .map((item) => ({
            date:
                firstString(
                    item.date,
                    item.day,
                    item.label,
                    item.period,
                    item.timestamp,
                    item.time,
                    item.bucket,
                    item.key,
                ) ?? new Date().toISOString(),
            revenue: 0,
            orders: pickNumber(
                item.orders,
                item.total_orders,
                item.count,
                item.order_count,
                item.orders_count,
                item.totalOrders,
                item.totalOrdersCount,
                item.total_orders_count,
                item.value,
            ),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
};

const mergeTimelinePoints = (revenuePoints: TimelinePoint[], orderPoints: TimelinePoint[]): TimelinePoint[] => {
    const map = new Map<string, TimelinePoint>();

    const ensureEntry = (date: string) => {
        let entry = map.get(date);
        if (!entry) {
            entry = { date, revenue: 0, orders: 0 };
            map.set(date, entry);
        }
        return entry;
    };

    for (const point of revenuePoints) {
        const entry = ensureEntry(point.date);
        entry.revenue = point.revenue;
        entry.orders = point.orders;
    }

    for (const point of orderPoints) {
        const entry = ensureEntry(point.date);
        entry.orders = point.orders;
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
};

export function useTeamStats(params: TeamStatsParams) {
    const queryOptions = {
        query: {
            keepPreviousData: true,
        },
    };

    const statsQuery = useTeamStatisticsControllerGetMyTeamStats<any>(params, queryOptions);
    const shipmentQuery = useTeamStatisticsControllerGetMyTeamShipmentStats<any>(params, queryOptions);

    const statsData = unwrapDataObject(statsQuery.data);
    const summarySource =
        pickRecord(
            statsData.overview,
            statsData.summary,
            statsData.metrics,
            statsData.stats,
            statsData.statistics,
            statsData.totals,
            statsData.meta,
        ) ?? statsData;

    const revenueSeries =
        pickArray(
            statsData.revenueByDay,
            statsData.revenue_by_day,
            statsData.dailyRevenue,
            statsData.daily_revenue,
            statsData.revenueTrend,
            statsData.revenue_trend,
            statsData.revenueSeries,
            statsData.revenue_series,
            statsData.timeline,
            statsData.revenuePoints,
            statsData.revenue_points,
            statsData.series?.revenue,
            statsData.series?.revenues,
        ) ?? [];

    const orderSeries =
        pickArray(
            statsData.ordersByDay,
            statsData.orders_by_day,
            statsData.dailyOrders,
            statsData.daily_orders,
            statsData.orderTrend,
            statsData.order_trend,
            statsData.ordersTrend,
            statsData.orders_trend,
            statsData.orderSeries,
            statsData.order_series,
            statsData.ordersSeries,
            statsData.orders_series,
            statsData.timeline,
            statsData.ordersPoints,
            statsData.orders_points,
            statsData.series?.orders,
        ) ?? [];

    const revenuePoints = mapRevenuePoints(revenueSeries);
    const orderPoints = mapOrderPoints(orderSeries);
    const timeline = mergeTimelinePoints(revenuePoints, orderPoints);

    const overview = {
        totalOrders: pickNumber(
            summarySource.totalOrders,
            summarySource.total_orders,
            summarySource.orders,
            summarySource.orderCount,
        ),
        totalRevenue: pickNumber(
            summarySource.totalRevenue,
            summarySource.total_revenue,
            summarySource.totalRevenueVnd,
            summarySource.total_revenue_vnd,
            summarySource.revenue,
            summarySource.revenue_vnd,
        ),
        averageOrderValue: pickNumber(
            summarySource.averageOrderValue,
            summarySource.average_order_value,
            summarySource.averageOrderValueVnd,
            summarySource.average_order_value_vnd,
            summarySource.avgOrderValue,
            summarySource.avg_order_value,
        ),
        completedOrders: pickNumber(
            summarySource.completedOrders,
            summarySource.completed,
            summarySource.successfulOrders,
            summarySource.deliveredOrders,
            summarySource.fulfilledOrders,
            summarySource.success_orders,
        ),
        pendingOrders: pickNumber(
            summarySource.pendingOrders,
            summarySource.pending,
            summarySource.processingOrders,
            summarySource.openOrders,
            summarySource.inProgressOrders,
        ),
        successRate: pickNumber(
            summarySource.successRate,
            summarySource.success_rate,
            summarySource.completionRate,
            summarySource.completion_rate,
            summarySource.conversionRate,
            summarySource.conversion_rate,
        ),
    };

    const shipmentsData = unwrapDataObject(shipmentQuery.data);
    const shipmentsSource =
        pickRecord(
            shipmentsData.overview,
            shipmentsData.summary,
            shipmentsData.metrics,
            shipmentsData.stats,
            shipmentsData.statuses,
            shipmentsData.state,
        ) ?? shipmentsData;

    const shipments: ShipmentSummary = {
        total: pickNumber(
            shipmentsSource.totalShipments,
            shipmentsSource.total,
            shipmentsSource.shipments,
            shipmentsSource.count,
        ),
        assigned: pickNumber(
            shipmentsSource.assigned,
            shipmentsSource.assignedShipments,
            shipmentsSource.assigned_count,
            shipmentsSource.assigned_shipments,
        ),
        inProgress: pickNumber(
            shipmentsSource.inProgress,
            shipmentsSource.in_progress,
            shipmentsSource.inTransit,
            shipmentsSource.in_transit,
            shipmentsSource.active,
        ),
        delivered: pickNumber(
            shipmentsSource.delivered,
            shipmentsSource.completed,
            shipmentsSource.successful,
            shipmentsSource.deliveredShipments,
            shipmentsSource.delivered_count,
        ),
        failed: pickNumber(
            shipmentsSource.failed,
            shipmentsSource.failedShipments,
            shipmentsSource.unsuccessful,
            shipmentsSource.failed_count,
        ),
        pending: pickNumber(
            shipmentsSource.pending,
            shipmentsSource.waiting,
            shipmentsSource.queued,
            shipmentsSource.pendingShipments,
        ),
    };

    return {
        overview,
        timeline,
        shipments,
        isLoading: statsQuery.isLoading || shipmentQuery.isLoading,
        isFetching: statsQuery.isFetching || shipmentQuery.isFetching,
        isError: statsQuery.isError || shipmentQuery.isError,
        error: statsQuery.error ?? shipmentQuery.error,
        refetch: async () => {
            await Promise.all([statsQuery.refetch(), shipmentQuery.refetch()]);
        },
    };
}
