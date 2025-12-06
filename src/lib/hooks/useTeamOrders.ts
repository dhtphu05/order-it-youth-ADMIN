'use client';

import { useOrdersControllerCheckout } from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type { CheckoutOrderDto } from '@/lib/api/generated/models';

export function useCheckoutOrder() {
    const mutation = useOrdersControllerCheckout();
    return {
        ...mutation,
        mutateAsync: async (data: CheckoutOrderDto) => {
            return mutation.mutateAsync({ data });
        },
    };
}
