'use client';

import { useQuery } from '@tanstack/react-query';
import {
    useTeamOrdersControllerGetOrder,
    getTeamOrdersControllerListOrdersQueryKey,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import { customInstance } from '@/lib/api/custom-instance';
import type { OrderResponseDto } from '@/lib/api/generated/models';

// Manual definition since generated controller is broken
export type TeamOrdersListParams = {
    page?: number;
    limit?: number;
    q?: string;
    paymentStatus?: string;
    fulfillmentType?: string;
    from?: string;
    to?: string;
};

export type TeamOrdersListResponse = {
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
};

// --- List Team Orders (Manual) ---
export function useTeamOrdersList(params?: TeamOrdersListParams) {
    return useQuery({
        // Use the generated query key base, append params
        queryKey: [...getTeamOrdersControllerListOrdersQueryKey(), params],
        queryFn: ({ signal }) =>
            customInstance<TeamOrdersListResponse>({
                url: '/api/team/orders', // Correct URL based on convention
                method: 'GET',
                params,
                signal,
            }),
    });
}

// --- Get Team Order Detail (Wrapped) ---
export function useTeamOrderDetail(code: string) {
    return useTeamOrdersControllerGetOrder(code, {
        query: { enabled: !!code },
    });
}
