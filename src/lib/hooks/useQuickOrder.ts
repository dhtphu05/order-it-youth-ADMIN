'use client';

import { useMemo } from 'react';
import {
    useAdminTeamsControllerGet,
    useAdminTeamsControllerList,
    useOrdersControllerCheckout,
    usePublicShipmentsControllerAssignShipper,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type {
    AdminTeamMemberDto,
    AdminTeamResponseDto,
    AdminTeamsControllerList200,
    CheckoutOrderDto,
    OrderResponseDto,
    PublicAssignShipperDto,
} from '@/lib/api/generated/models';

type CheckoutInput = {
    payload: CheckoutOrderDto;
    shipperId?: string;
};

const extractTeamList = (payload: unknown): AdminTeamResponseDto[] => {
    if (!payload) return [];
    if (Array.isArray((payload as any)?.data)) {
        return (payload as any).data as AdminTeamResponseDto[];
    }
    if (Array.isArray(payload)) {
        return payload as AdminTeamResponseDto[];
    }
    return [];
};

export function useQuickOrderTeams(params?: { search?: string }) {
    const query = useAdminTeamsControllerList<AdminTeamsControllerList200>(
        params?.search ? { q: params.search, isActive: true } : { isActive: true },
        {
            query: {
                keepPreviousData: true,
            },
        },
    );

    const teams = useMemo(() => {
        return extractTeamList(query.data).filter((team) => (team?.isActive ?? true));
    }, [query.data]);

    return {
        ...query,
        teams,
    };
}

export function useQuickOrderTeamMembers(teamId?: string) {
    const query = useAdminTeamsControllerGet<AdminTeamResponseDto>(teamId ?? '', {
        query: {
            enabled: Boolean(teamId),
        },
    });

    const members = useMemo<AdminTeamMemberDto[]>(() => {
        if (!teamId) {
            return [];
        }
        return Array.isArray(query.data?.members) ? (query.data?.members as AdminTeamMemberDto[]) : [];
    }, [teamId, query.data]);

    return {
        ...query,
        members,
    };
}

export function useQuickOrderCheckout() {
    const checkoutMutation = useOrdersControllerCheckout<OrderResponseDto>();
    const assignMutation = usePublicShipmentsControllerAssignShipper<void>();

    const checkout = async ({ payload, shipperId }: CheckoutInput) => {
        const order = await checkoutMutation.mutateAsync({ data: payload });
        if (shipperId) {
            const assignPayload: PublicAssignShipperDto = {
                order_code: order.code,
                shipper_id: shipperId,
            };
            await assignMutation.mutateAsync({ data: assignPayload });
        }
        return order;
    };

    return {
        checkout,
        isPending: checkoutMutation.isPending || assignMutation.isPending,
        checkoutError: checkoutMutation.error ?? assignMutation.error,
        checkoutMutation,
        assignMutation,
    };
}
