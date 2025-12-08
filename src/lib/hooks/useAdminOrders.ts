'use client';

import { useMutation, useQueryClient, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';
import {
    adminOrdersControllerGet,
    adminOrdersControllerList,
    getAdminOrdersControllerGetQueryKey,
    getAdminOrdersControllerListQueryKey,
    useAdminOrdersControllerCancel,
    useAdminOrdersControllerConfirmPayment,
    useAdminOrdersControllerGet,
    useAdminOrdersControllerList,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import { customInstance } from '@/lib/api/custom-instance';
import type {
    AdminCancelOrderDto,
    AdminConfirmPaymentDto,
    AdminOrdersControllerListParams,
    OrderItemResponseDto,
    OrderResponseDto,
    PaymentRecordDto,
} from '@/lib/api/generated/models';

export type AdminOrderItem = OrderItemResponseDto & {
    title_snapshot?: string;
};

export type AdminOrder = Omit<OrderResponseDto, 'items'> & {
    items: AdminOrderItem[];
    created_at?: string;
    createdAt?: string;
    email?: string;
    address?: string;
    note?: string;
    referral_code?: string;
    payments?: PaymentRecordDto[];
    shipment?: {
        status?: string;
        assigned_name?: string;
        assigned_phone?: string;
        pickup_eta?: string;
        delivered_at?: string;
    };
};

export type AdminOrdersListResponse = {
    data: AdminOrder[];
    total: number;
    page: number;
    limit: number;
};

type ListQueryOptions = Partial<
    UseQueryOptions<
        Awaited<ReturnType<typeof adminOrdersControllerList>>,
        unknown,
        AdminOrdersListResponse
    >
>;

type DetailQueryOptions = Partial<
    UseQueryOptions<Awaited<ReturnType<typeof adminOrdersControllerGet>>, unknown, AdminOrder>
>;

export function useAdminOrdersList(params?: AdminOrdersControllerListParams) {
    const queryOptions = {
        queryKey: getAdminOrdersControllerListQueryKey(params),
        queryFn: ({ signal }) =>
            customInstance<AdminOrdersListResponse>({
                url: '/api/admin/orders',
                method: 'GET',
                params,
                signal,
            }),
    } as ListQueryOptions;

    return useAdminOrdersControllerList<AdminOrdersListResponse>(params, {
        query: queryOptions,
    });
}

export function useAdminOrderDetail(code: string) {
    const detailQuery = {
        enabled: Boolean(code),
        select: (response) => response as unknown as AdminOrder,
    } as DetailQueryOptions;

    return useAdminOrdersControllerGet<AdminOrder>(code, {
        query: detailQuery,
    });
}

type ConfirmPaymentInput = {
    code: string;
    amountVnd: number;
    force?: boolean;
};

export function useAdminConfirmPayment() {
    const queryClient = useQueryClient();

    const mutation = useAdminOrdersControllerConfirmPayment({
        mutation: {
            onSuccess: async (_data, variables) => {
                const listKey = getAdminOrdersControllerListQueryKey();
                await queryClient.invalidateQueries({
                    queryKey: listKey as unknown as QueryKey,
                    exact: false,
                });

                if (variables?.code) {
                    await queryClient.invalidateQueries({
                        queryKey: getAdminOrdersControllerGetQueryKey(variables.code) as unknown as QueryKey,
                    });
                }
            },
        },
    });

    const confirmPayment = ({ code, amountVnd, force }: ConfirmPaymentInput) => {
        const payload: AdminConfirmPaymentDto = {
            amountVnd,
            force,
        };

        return mutation.mutateAsync({ code, data: payload });
    };

    return {
        ...mutation,
        confirmPayment,
    };
}

type CancelOrderInput = {
    code: string;
    reason: string;
};

export function useAdminCancelOrder() {
    const queryClient = useQueryClient();

    const mutation = useAdminOrdersControllerCancel({
        mutation: {
            onSuccess: async (_data, variables) => {
                const listKey = getAdminOrdersControllerListQueryKey();
                await queryClient.invalidateQueries({
                    queryKey: listKey as unknown as QueryKey,
                    exact: false,
                });

                if (variables?.code) {
                    await queryClient.invalidateQueries({
                        queryKey: getAdminOrdersControllerGetQueryKey(variables.code) as unknown as QueryKey,
                    });
                }
            },
        },
    });

    const cancelOrder = ({ code, reason }: CancelOrderInput) => {
        const payload: AdminCancelOrderDto = { reason };
        return mutation.mutateAsync({ code, data: payload });
    };

    return {
        ...mutation,
        cancelOrder,
    };
}

type DeleteOrderInput = {
    code: string;
};

export function useAdminDeleteOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation<void, unknown, DeleteOrderInput>({
        mutationFn: ({ code }) =>
            customInstance({
                url: `/api/admin/orders/${code}`,
                method: 'DELETE',
            }),
        onSuccess: async (_data, variables) => {
            const listKey = getAdminOrdersControllerListQueryKey();
            await queryClient.invalidateQueries({
                queryKey: listKey as unknown as QueryKey,
                exact: false,
            });

            if (variables?.code) {
                await queryClient.invalidateQueries({
                    queryKey: getAdminOrdersControllerGetQueryKey(variables.code) as unknown as QueryKey,
                });
            }
        },
    });

    const deleteOrder = ({ code }: DeleteOrderInput) => mutation.mutateAsync({ code });

    return {
        ...mutation,
        deleteOrder,
    };
}
