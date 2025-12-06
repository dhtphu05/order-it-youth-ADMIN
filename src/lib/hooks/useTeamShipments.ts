'use client';

import {
    useTeamShipmentsControllerListUnassigned,
    useTeamShipmentsControllerListMyShipments,
    useTeamShipmentsControllerAssignSelf,
    useTeamShipmentsControllerAssignToUser,
    useTeamShipmentsControllerStartDelivery,
    useTeamShipmentsControllerMarkDelivered,
    useTeamShipmentsControllerMarkFailed,
    getTeamShipmentsControllerListUnassignedQueryKey,
    getTeamShipmentsControllerListMyShipmentsQueryKey,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type {
    TeamAssignOrderDto,
    TeamStartDeliveryDto,
    TeamMarkFailedDto,
} from '@/lib/api/generated/models';
import { useQueryClient } from '@tanstack/react-query';

export function useUnassignedShipments() {
    return useTeamShipmentsControllerListUnassigned();
}

export function useMyShipments() {
    return useTeamShipmentsControllerListMyShipments();
}

export function useAssignShipmentSelf() {
    const queryClient = useQueryClient();
    const mutation = useTeamShipmentsControllerAssignSelf();

    return {
        ...mutation,
        mutateAsync: async (code: string) => {
            const result = await mutation.mutateAsync({ code });
            await queryClient.invalidateQueries({
                queryKey: getTeamShipmentsControllerListUnassignedQueryKey(),
            });
            await queryClient.invalidateQueries({
                queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey(),
            });
            return result;
        },
    };
}

export function useAssignShipmentToUser() {
    const queryClient = useQueryClient();
    const mutation = useTeamShipmentsControllerAssignToUser();

    return {
        ...mutation,
        mutateAsync: async (args: { code: string; data: TeamAssignOrderDto }) => {
            const result = await mutation.mutateAsync({ code: args.code, data: args.data });
            await queryClient.invalidateQueries({
                queryKey: getTeamShipmentsControllerListUnassignedQueryKey(),
            });
            // Might affect user's shipments, so invalidate broadly or specific if possible.
            // For now, assume it affects general lists.
            await queryClient.invalidateQueries({
                queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey(),
            });
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
            await queryClient.invalidateQueries({
                queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey(),
            });
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
            const result = await mutation.mutateAsync({ code });
            await queryClient.invalidateQueries({
                queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey(),
            });
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
            await queryClient.invalidateQueries({
                queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey(),
            });
            return result;
        },
    };
}
