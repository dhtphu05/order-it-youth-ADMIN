'use client';

import type { UseQueryOptions } from '@tanstack/react-query';
import {
    getTeamOrdersControllerListOrdersQueryKey,
    teamOrdersControllerGetOrder,
    teamOrdersControllerListOrders,
    useTeamOrdersControllerGetOrder,
    useTeamOrdersControllerListOrders,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import { customInstance } from '@/lib/api/custom-instance';
import type { OrderItemResponseDto, OrderResponseDto } from '@/lib/api/generated/models';

export type TeamOrderItem = OrderItemResponseDto & {
    title_snapshot?: string;
};

export type TeamOrder = Omit<OrderResponseDto, 'items'> & {
    items: TeamOrderItem[];
    created_at?: string;
    address?: string;
    note?: string;
    referral_code?: string;
    shipment?: {
        status?: string;
        assigned_name?: string;
        assigned_phone?: string;
        pickup_eta?: string;
        delivered_at?: string;
    };
};

export type TeamOrdersListParams = {
    page?: number;
    limit?: number;
    q?: string;
    paymentStatus?: string;
    fulfillmentType?: string;
    from?: string;
    to?: string;
};

export type OrderItem = {
    id: string;
    code?: string;
    full_name?: string;
    phone?: string;
    payment_status: string;
    order_status: string;
    grand_total_vnd?: number;
    created_at?: string;
    items?: any[];
    team_id?: string;
    shipper_id?: string;
};

export type TeamOrdersListResponse = {
    data: TeamOrder[];
    total: number;
    page: number;
    limit: number;
};

type ListQueryOptions = Partial<
    UseQueryOptions<
        Awaited<ReturnType<typeof teamOrdersControllerListOrders>>,
        unknown,
        TeamOrdersListResponse
    >
>;

type DetailQueryOptions = Partial<
    UseQueryOptions<
        Awaited<ReturnType<typeof teamOrdersControllerGetOrder>>,
        unknown,
        TeamOrder
    >
>;

export function useTeamOrdersList(params?: TeamOrdersListParams) {
    const queryOptions = {
        queryKey: [...getTeamOrdersControllerListOrdersQueryKey(), params],
        queryFn: ({ signal }) =>
            customInstance<TeamOrdersListResponse>({
                url: '/api/team/orders',
                method: 'GET',
                params,
                signal,
            }),
    } as ListQueryOptions;

    return useTeamOrdersControllerListOrders<TeamOrdersListResponse>({
        query: queryOptions,
    });
}

export function useTeamOrderDetail(code: string) {
    const detailQuery = {
        enabled: Boolean(code),
        select: (response) => response as unknown as TeamOrder,
    } as DetailQueryOptions;

    return useTeamOrdersControllerGetOrder<TeamOrder>(code, {
        query: detailQuery,
    });
}
