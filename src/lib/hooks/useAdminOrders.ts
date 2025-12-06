'use client';

import {
    useAdminOrdersControllerList,
    useAdminOrdersControllerGet,
    useAdminOrdersControllerConfirmPayment,
    useAdminOrdersControllerStartFulfilment,
    useAdminOrdersControllerFailFulfilment,
    useAdminOrdersControllerRetryFulfilment,
    useAdminOrdersControllerCompleteFulfilment,
    useAdminOrdersControllerCancel,
    getAdminOrdersControllerListQueryKey,
    getAdminOrdersControllerGetQueryKey,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type {
    AdminOrdersControllerListParams,
    AdminConfirmPaymentDto,
    AdminStartFulfilmentDto,
    AdminFailFulfilmentDto,
    AdminRetryFulfilmentDto,
    AdminCompleteFulfilmentDto,
    AdminCancelOrderDto,
} from '@/lib/api/generated/models';
import { useQueryClient } from '@tanstack/react-query';

export function useAdminOrdersList(params?: AdminOrdersControllerListParams) {
    return useAdminOrdersControllerList(params);
}

export function useAdminOrderDetail(code: string) {
    return useAdminOrdersControllerGet(code, {
        query: { enabled: !!code },
    });
}

function useOrderMutation<TDto>(
    mutationHook: () => any,
    invalidateList = true,
    invalidateDetail = true
) {
    const queryClient = useQueryClient();
    const mutation = mutationHook();

    return {
        ...mutation,
        mutateAsync: async (args: { code: string; data: TDto }) => {
            const result = await mutation.mutateAsync({ code: args.code, data: args.data });

            if (invalidateList) {
                await queryClient.invalidateQueries({
                    // @ts-ignore - Generic query key retrieval might be tricky to type perfectly without explicit imported function
                    queryKey: getAdminOrdersControllerListQueryKey(),
                });
            }

            if (invalidateDetail) {
                await queryClient.invalidateQueries({
                    queryKey: getAdminOrdersControllerGetQueryKey(args.code),
                });
            }
            return result;
        },
    };
}

export function useAdminOrderConfirmPayment() {
    return useOrderMutation<AdminConfirmPaymentDto>(useAdminOrdersControllerConfirmPayment);
}

export function useAdminOrderStartFulfilment() {
    return useOrderMutation<AdminStartFulfilmentDto>(useAdminOrdersControllerStartFulfilment);
}

export function useAdminOrderFailFulfilment() {
    return useOrderMutation<AdminFailFulfilmentDto>(useAdminOrdersControllerFailFulfilment);
}

export function useAdminOrderRetryFulfilment() {
    return useOrderMutation<AdminRetryFulfilmentDto>(useAdminOrdersControllerRetryFulfilment);
}

export function useAdminOrderCompleteFulfilment() {
    return useOrderMutation<AdminCompleteFulfilmentDto>(useAdminOrdersControllerCompleteFulfilment);
}

export function useAdminOrderCancel() {
    return useOrderMutation<AdminCancelOrderDto>(useAdminOrdersControllerCancel);
}
