'use client';

import { useMemo } from 'react';
import {
    useTeamStatisticsControllerGetMyTeamStats,
    useTeamStatisticsControllerGetTeamDailyStats,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';

export type TeamStatsParams = {
    from: string;
    to: string;
};

export interface TeamStatsResponse {
    period?: {
        from?: string;
        to?: string;
    };
    teams: TeamStatItem[];
}

export interface TeamStatItem {
    team: {
        id: string;
        code: string;
        name: string;
    };
    total_revenue_vnd: number;
    total_orders: number;
    orders_by_status: Record<string, number>;
}

type StatusEntry = {
    status: string;
    count: number;
};

const SUCCESS_STATUSES = ['SUCCESS', 'COMPLETED', 'DELIVERED'];
const FAILURE_STATUSES = ['FAILED', 'CANCELLED', 'REFUNDED'];

export interface TeamDailyStatItem {
    date: string;
    total_orders: number;
    revenue: number;
}

const sumStatuses = (map: Record<string, number>, statuses: string[]) => {
    let total = 0;
    for (const key of statuses) {
        const normalized = key.toUpperCase();
        total += map[normalized] ?? map[key] ?? 0;
    }
    return total;
};

export function useTeamStats(params: TeamStatsParams) {
    const statsQuery = useTeamStatisticsControllerGetMyTeamStats<TeamStatsResponse>(params, {
        query: {
            keepPreviousData: true,
        },
    });
    const dailyQuery = useTeamStatisticsControllerGetTeamDailyStats<TeamDailyStatItem[]>(params, {
        query: {
            keepPreviousData: true,
        },
    });

    const teams = Array.isArray(statsQuery.data?.teams) ? statsQuery.data?.teams ?? [] : [];

    const statusTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        for (const team of teams) {
            Object.entries(team.orders_by_status ?? {}).forEach(([status, count]) => {
                const key = status?.toUpperCase?.() ?? 'UNKNOWN';
                totals[key] = (totals[key] ?? 0) + (typeof count === 'number' ? count : 0);
            });
        }
        return totals;
    }, [teams]);

    const totalOrders = teams.reduce((sum, team) => sum + (team.total_orders ?? 0), 0);
    const totalRevenue = teams.reduce((sum, team) => sum + (team.total_revenue_vnd ?? 0), 0);
    const successOrders = sumStatuses(statusTotals, SUCCESS_STATUSES);
    const failedOrders = sumStatuses(statusTotals, FAILURE_STATUSES);
    const pendingOrders = Math.max(totalOrders - successOrders - failedOrders, 0);

    const overview = {
        totalOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        completedOrders: successOrders,
        pendingOrders,
        successRate: totalOrders > 0 ? (successOrders / totalOrders) * 100 : 0,
    };

    const teamBreakdown = teams.map((team) => ({
        id: team.team?.id ?? team.team?.code ?? team.team?.name ?? Math.random().toString(36),
        code: team.team?.code ?? 'N/A',
        name: team.team?.name ?? 'Không rõ',
        totalRevenue: team.total_revenue_vnd ?? 0,
        totalOrders: team.total_orders ?? 0,
        ordersByStatus: Object.fromEntries(
            Object.entries(team.orders_by_status ?? {}).map(([status, count]) => [
                status?.toUpperCase?.() ?? status,
                count,
            ]),
        ),
    }));

    const statusBreakdown: StatusEntry[] = Object.entries(statusTotals)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);

    const dailyStats =
        (Array.isArray(dailyQuery.data)
            ? dailyQuery.data
            : Array.isArray((dailyQuery.data as any)?.data)
              ? (dailyQuery.data as any).data
              : []
        )
            .map((item: TeamDailyStatItem) => ({
                date: item.date ?? new Date().toISOString(),
                total_orders: typeof item.total_orders === 'number' ? item.total_orders : 0,
                revenue: typeof item.revenue === 'number' ? item.revenue : 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

    return {
        overview,
        teamBreakdown,
        statusBreakdown,
        dailyStats,
        period: statsQuery.data?.period,
        isLoading: statsQuery.isLoading || dailyQuery.isLoading,
        isFetching: statsQuery.isFetching || dailyQuery.isFetching,
        isError: statsQuery.isError || dailyQuery.isError,
        error: statsQuery.error ?? dailyQuery.error,
        refetch: async () => {
            await Promise.all([statsQuery.refetch(), dailyQuery.refetch()]);
        },
    };
}
