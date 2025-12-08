'use client';
import {
    useAdminStatisticsControllerGetOverallStats,
    useAdminStatisticsControllerGetTeamStats,
    useAdminStatisticsControllerGetDailyStats,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';

export type AdminStatsParams = {
    from: string;
    to: string;
};

type RevenuePoint = {
    date: string;
    revenue: number;
    orders: number;
};

type TeamBreakdownPoint = {
    team: string;
    orders: number;
    revenue: number;
};

type PaymentBreakdownPoint = {
    method: string;
    orders: number;
    revenue: number;
};

type OrderPoint = {
    date: string;
    orders: number;
};

type AnyRecord = Record<string, any>;

const DATA_ENVELOPE_KEYS = ['data', 'result', 'payload', 'response', 'value', 'content'] as const;
const ARRAY_ENVELOPE_KEYS = [...DATA_ENVELOPE_KEYS, 'items', 'rows', 'values', 'list'] as const;

const isRecord = (value: unknown): value is AnyRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const unwrapDataObject = (value: unknown): AnyRecord => {
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

const pickRecord = (...values: unknown[]): AnyRecord | undefined => {
    for (const value of values) {
        if (isRecord(value)) {
            return value;
        }
    }
    return undefined;
};

const pickArray = (...values: unknown[]): any[] | undefined => {
    for (const value of values) {
        const unwrapped = unwrapArrayValue(value);
        if (unwrapped !== undefined) {
            return unwrapped;
        }
    }
    return undefined;
};

const preferArray = (...arrays: Array<any[] | undefined>): any[] | undefined => {
    for (const arr of arrays) {
        if (Array.isArray(arr) && arr.length > 0) {
            return arr;
        }
    }
    return arrays.find((arr) => Array.isArray(arr));
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

const mapRevenuePoints = (input?: any[]): RevenuePoint[] => {
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
                ) ??
                new Date().toISOString(),
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

const mapOrderPoints = (input?: any[]): OrderPoint[] => {
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
                ) ??
                new Date().toISOString(),
            orders: pickNumber(
                item.orders,
                item.total_orders,
                item.totalOrders,
                item.totalOrdersCount,
                item.total_orders_count,
                item.count,
                item.order_count,
                item.orders_count,
                item.quantity,
                item.total_quantity,
                item.value,
            ),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
};

const mapPaymentBreakdown = (input?: any[]): PaymentBreakdownPoint[] => {
    if (!Array.isArray(input)) {
        return [];
    }

    return input.map((item) => ({
        method:
            firstString(item.method, item.payment_method, item.label, item.name) ??
            'KHÁC',
        orders: pickNumber(
            item.orders,
            item.total_orders,
            item.count,
            item.order_count,
            item.orders_count,
        ),
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
    }));
};

const mapTeamBreakdown = (input?: any[]): TeamBreakdownPoint[] => {
    if (!Array.isArray(input)) {
        return [];
    }

    return input
        .map((item) => ({
            team:
                firstString(
                    item.team,
                    item.team_name,
                    item.teamName,
                    item.code,
                    item.name,
                    item.label,
                    item.title,
                    item.team_code,
                    item.teamCode,
                    item.team_label,
                    item.team?.name,
                    item.team?.code,
                    item.team?.label,
                    item.teamInfo?.name,
                    item.teamInfo?.label,
                    item.teamInfo?.code,
                    item.metadata?.team,
                    item.metadata?.team_name,
                ) ?? 'Không rõ',
            orders: pickNumber(
                item.orders,
                item.total_orders,
                item.totalOrders,
                item.totalOrdersCount,
                item.total_orders_count,
                item.count,
                item.order_count,
                item.orders_count,
            ),
            revenue: pickNumber(
                item.revenue,
                item.revenue_vnd,
                item.total_revenue_vnd,
                item.amount,
                item.amount_vnd,
                item.total_amount,
                item.total_amount_vnd,
                item.value,
                item.totalRevenue,
                item.totalRevenueVnd,
                item.total_revenue,
                item.total_amounts,
                item.sumRevenue,
                item.sum_revenue,
                item.revenueVnd,
                item.revenue_vnd_total,
            ),
        }))
        .sort((a, b) => b.revenue - a.revenue);
};

const mergeRevenueAndOrders = (revenuePoints: RevenuePoint[], orderPoints: OrderPoint[]): RevenuePoint[] => {
    const map = new Map<string, RevenuePoint>();

    const ensureEntry = (date: string) => {
        let existing = map.get(date);
        if (!existing) {
            existing = { date, revenue: 0, orders: 0 };
            map.set(date, existing);
        }
        return existing;
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

export { getStatsRangeDates as getRangeDates } from '@/src/lib/utils/stats-range';

export function useAdminStats(params: AdminStatsParams) {
    const queryOptions = {
        query: {
            keepPreviousData: true,
        },
    };

    const overallQuery = useAdminStatisticsControllerGetOverallStats<any>(params, queryOptions);
    const teamQuery = useAdminStatisticsControllerGetTeamStats<any>(params, queryOptions);
    const dailyQuery = useAdminStatisticsControllerGetDailyStats<any>(params, queryOptions);

    const overallData = unwrapDataObject(overallQuery.data);
    const summarySource =
        pickRecord(
            overallData.overview,
            overallData.summary,
            overallData.metrics,
            overallData.stats,
            overallData.statistics,
            overallData.totals,
            overallData.meta,
        ) ?? overallData;
    const chartsSection = pickRecord(
        overallData.charts,
        overallData.chart,
        overallData.trends,
        overallData.trend,
        overallData.timeline,
        overallData.series,
        overallData.history,
        overallData.graph,
    );
    const breakdownSection = pickRecord(
        overallData.breakdowns,
        overallData.breakdown,
        overallData.distribution,
        overallData.analytics,
        overallData.segments,
        overallData.partition,
    );

    const teamRaw = teamQuery.data;
    const teamData =
        pickArray(
            teamRaw,
            teamRaw?.data,
            teamRaw?.result,
            teamRaw?.payload,
            teamRaw?.items,
            teamRaw?.values,
            teamRaw?.teams,
            teamRaw?.teamStats,
            teamRaw?.team_stats,
        ) ?? [];
    const dailyRaw = dailyQuery.data;
    const dailyData = Array.isArray(dailyRaw) ? dailyRaw : unwrapDataObject(dailyRaw);

    const overview = {
        totalOrders: pickNumber(
            summarySource.totalOrders,
            summarySource.total_orders,
            summarySource.orders,
            summarySource.orderCount,
            summarySource.totalOrdersCount,
            summarySource.total_orders_count,
            overallData.totalOrders,
            overallData.total_orders,
            overallData.orders,
            overallData.orderCount,
        ),
        totalRevenue: pickNumber(
            summarySource.totalRevenue,
            summarySource.totalRevenueVnd,
            summarySource.total_revenue,
            summarySource.total_revenue_vnd,
            summarySource.totalAmount,
            summarySource.total_amount,
            summarySource.revenue,
            summarySource.revenue_vnd,
            summarySource.total_amount_vnd,
            overallData.totalRevenue,
            overallData.totalRevenueVnd,
            overallData.total_revenue,
            overallData.total_revenue_vnd,
        ),
        averageOrderValue: pickNumber(
            summarySource.averageOrderValue,
            summarySource.averageOrderValueVnd,
            summarySource.average_order_value,
            summarySource.average_order_value_vnd,
            summarySource.avgOrderValue,
            summarySource.avg_order_value,
            summarySource.avg_order_value_vnd,
            summarySource.averageTicketSize,
            summarySource.average_ticket_size,
            summarySource.average_ticket_size_vnd,
            overallData.averageOrderValue,
            overallData.averageOrderValueVnd,
            overallData.average_order_value,
            overallData.average_order_value_vnd,
        ),
        successRate: pickNumber(
            summarySource.successRate,
            summarySource.success_rate,
            summarySource.success_ratio,
            summarySource.successRatePct,
            summarySource.success_rate_pct,
            summarySource.success_rate_percent,
            summarySource.successPercent,
            summarySource.success_percent,
            summarySource.conversionRate,
            summarySource.conversion_rate,
            summarySource.fulfillmentRate,
            summarySource.fulfillment_rate,
            overallData.successRate,
            overallData.success_rate,
            overallData.success_ratio,
        ),
    };

    const dailyCombinedSeries =
        pickArray(
            dailyRaw,
            dailyData,
            dailyData?.daily,
            dailyData?.stats,
            dailyData?.statistics,
            dailyData?.timeline,
            dailyData?.history,
            dailyData?.series,
            dailyData?.data,
            dailyData?.points,
            dailyData?.items,
            dailyData?.rows,
        ) ?? [];
    const dailyRevenueSeries =
        pickArray(
            dailyData?.revenueByDay,
            dailyData?.revenue_by_day,
            dailyData?.dailyRevenue,
            dailyData?.daily_revenue,
            dailyData?.revenueTrend,
            dailyData?.revenue_trend,
            dailyData?.revenueSeries,
            dailyData?.revenue_series,
            dailyData?.revenues,
            dailyData?.revenue,
            dailyData?.amounts,
            dailyData?.amount_series,
            dailyData?.chart?.revenue,
            dailyData?.charts?.revenue,
            dailyData?.charts?.revenues,
            dailyData?.series?.revenue,
            dailyData?.series?.revenues,
        ) ?? [];
    const dailyOrderSeries =
        pickArray(
            dailyData?.ordersByDay,
            dailyData?.orders_by_day,
            dailyData?.dailyOrders,
            dailyData?.daily_orders,
            dailyData?.orderTrend,
            dailyData?.order_trend,
            dailyData?.ordersTrend,
            dailyData?.orders_trend,
            dailyData?.orderSeries,
            dailyData?.order_series,
            dailyData?.ordersSeries,
            dailyData?.orders_series,
            dailyData?.orders,
            dailyData?.order,
            dailyData?.quantities,
            dailyData?.counts,
            dailyData?.chart?.orders,
            dailyData?.charts?.orders,
            dailyData?.series?.orders,
        ) ?? [];

    const overallRevenueSeries =
        pickArray(
            overallData.revenueByDay,
            overallData.revenue_by_day,
            overallData.dailyRevenue,
            overallData.daily_revenue,
            overallData.ordersByDay,
            overallData.orders_by_day,
            overallData.revenueTrend,
            overallData.revenue_trend,
            overallData.revenueSeries,
            overallData.revenue_series,
            overallData.revenuePoints,
            overallData.revenue_points,
            chartsSection?.revenue,
            chartsSection?.revenues,
            chartsSection?.revenueByDay,
            chartsSection?.revenue_by_day,
            chartsSection?.dailyRevenue,
            chartsSection?.daily_revenue,
            chartsSection?.series,
            chartsSection?.data,
            chartsSection?.points,
        ) ?? [];
    const overallOrderSeries =
        pickArray(
            overallData.ordersByDay,
            overallData.orders_by_day,
            overallData.dailyOrders,
            overallData.daily_orders,
            overallData.orderTrend,
            overallData.order_trend,
            overallData.ordersTrend,
            overallData.orders_trend,
            overallData.orderSeries,
            overallData.order_series,
            overallData.ordersSeries,
            overallData.orders_series,
            overallData.ordersPoints,
            overallData.orders_points,
            overallData.orderHistory,
            overallData.order_history,
            chartsSection?.orders,
            chartsSection?.order,
            chartsSection?.ordersByDay,
            chartsSection?.orders_by_day,
            chartsSection?.dailyOrders,
            chartsSection?.daily_orders,
            chartsSection?.orderTrend,
            chartsSection?.order_trend,
            chartsSection?.series,
            chartsSection?.data,
            chartsSection?.points,
        ) ?? [];

    const revenueSeriesSource = preferArray(dailyRevenueSeries, dailyCombinedSeries, overallRevenueSeries) ?? [];
    const orderSeriesSource = preferArray(dailyOrderSeries, dailyCombinedSeries, overallOrderSeries) ?? [];

    const revenuePoints = mapRevenuePoints(revenueSeriesSource);
    const orderPoints = mapOrderPoints(orderSeriesSource);
    const revenueByDay = mergeRevenueAndOrders(revenuePoints, orderPoints);

    const paymentBreakdown = mapPaymentBreakdown(
        pickArray(
            overallData.paymentBreakdown,
            overallData.payment_breakdown,
            overallData.paymentMethodBreakdown,
            overallData.payment_method_breakdown,
            overallData.paymentMethods,
            overallData.payment_methods,
            overallData.paymentSummary,
            overallData.payment_summary,
            breakdownSection?.paymentBreakdown,
            breakdownSection?.payment_breakdown,
            breakdownSection?.paymentMethods,
            breakdownSection?.payment_methods,
            breakdownSection?.payments,
            breakdownSection?.payment,
        ),
    );

    const teamBreakdownSource =
        pickArray(
            overallData.teamBreakdown,
            overallData.team_breakdown,
            overallData.teams,
            overallData.teamStats,
            overallData.team_stats,
            overallData.topTeams,
            overallData.top_teams,
            overallData.leaderboard,
            breakdownSection?.teams,
            breakdownSection?.teamBreakdown,
            breakdownSection?.team_breakdown,
        ) ?? [];
    const teamBreakdown = mapTeamBreakdown(
        teamBreakdownSource.length > 0 ? teamBreakdownSource : teamData,
    );

    return {
        overview,
        revenueByDay,
        teamBreakdown,
        paymentBreakdown,
        isLoading: overallQuery.isLoading || teamQuery.isLoading || dailyQuery.isLoading,
        isFetching: overallQuery.isFetching || teamQuery.isFetching || dailyQuery.isFetching,
        isError: overallQuery.isError || teamQuery.isError || dailyQuery.isError,
        error: overallQuery.error ?? teamQuery.error ?? dailyQuery.error,
        refetch: async () => {
            await Promise.all([overallQuery.refetch(), teamQuery.refetch(), dailyQuery.refetch()]);
        },
    };
}
