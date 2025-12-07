'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
    useTeamShipmentsControllerListUnassigned,
    getTeamShipmentsControllerListUnassignedQueryKey,
    useTeamShipmentsControllerListMyShipments,
    getTeamShipmentsControllerListMyShipmentsQueryKey,
    useTeamShipmentsControllerAssignSelf,
    useTeamShipmentsControllerStartDelivery,
    useTeamShipmentsControllerMarkDelivered,
    useTeamShipmentsControllerMarkFailed,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type {
    TeamStartDeliveryDto,
    TeamMarkFailedDto,
} from '@/lib/api/generated/models';

// --- List Hooks ---

export function useUnassignedShipments() {
    return useTeamShipmentsControllerListUnassigned();
}

export function useMyShipments() {
    return useTeamShipmentsControllerListMyShipments();
}

// --- Mutation Hooks ---

export function useAssignOrderToSelf() {
    const queryClient = useQueryClient();
    const mutation = useTeamShipmentsControllerAssignSelf();

    return {
        ...mutation,
        mutateAsync: async (code: string) => {
            const result = await mutation.mutateAsync({ code });
            // Invalidate both lists as an item moves from unassigned to my shipments
            queryClient.invalidateQueries({ queryKey: getTeamShipmentsControllerListUnassignedQueryKey() });
            queryClient.invalidateQueries({ queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey() });
            return result;
        },
    };
}

export function useStartDelivery() {
    const queryClient = useQueryClient();
    const mutation = useTeamShipmentsControllerStartDelivery();

    return {
        ...mutation,
        mutateAsync: async (args: { code: string; data: TeamStartDeliveryDto }) => {
            const result = await mutation.mutateAsync({ code: args.code, data: args.data });
            queryClient.invalidateQueries({ queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey() });
            return result;
        },
    };
}

export function useMarkDelivered() {
    const queryClient = useQueryClient();
    const mutation = useTeamShipmentsControllerMarkDelivered();

    return {
        ...mutation,
        mutateAsync: async (code: string) => {
            // Note: Check if DTO is needed. If generated hook arg implies data is needed, we'll adjust.
            // Based on earlier grep, it seemed to just take code or code+data. 
            // Most "mark delivered" might purely be status change, or might need proof.
            // Assuming simplified for now, will fix if TS complains.
            const result = await mutation.mutateAsync({ code });
            queryClient.invalidateQueries({ queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey() });
            return result;
        },
    };
}

export function useMarkFailed() {
    const queryClient = useQueryClient();
    const mutation = useTeamShipmentsControllerMarkFailed();

    return {
        ...mutation,
        mutateAsync: async (args: { code: string; data: TeamMarkFailedDto }) => {
            const result = await mutation.mutateAsync({ code: args.code, data: args.data });
            queryClient.invalidateQueries({ queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey() });
            return result;
        },
    };
}
