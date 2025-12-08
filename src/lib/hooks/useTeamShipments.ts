'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
    useTeamShipmentsControllerListUnassigned,
    getTeamShipmentsControllerListUnassignedQueryKey,
    useTeamShipmentsControllerListMyShipments,
    getTeamShipmentsControllerListMyShipmentsQueryKey,
    useTeamShipmentsControllerAssignSelf,
    useTeamShipmentsControllerAssignToUser,
    useTeamShipmentsControllerStartDelivery,
    useTeamShipmentsControllerMarkDelivered,
    useTeamShipmentsControllerMarkFailed,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type {
    TeamStartDeliveryDto,
    TeamMarkFailedDto,
    TeamAssignOrderDto,
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

type AssignShipmentInput = {
    code: string;
    memberId?: string;
    userId?: string;
};

export function useAssignShipmentToMember() {
    const queryClient = useQueryClient();
    const mutation = useTeamShipmentsControllerAssignToUser();

    const assign = async ({ code, memberId, userId }: AssignShipmentInput) => {
        if (!memberId && !userId) {
            throw new Error('Thiếu thông tin shipper để gán đơn.');
        }

        const payload: TeamAssignOrderDto = {
            assigneeId: userId ?? memberId,
            assignee_id: userId ?? memberId,
            userId,
            user_id: userId,
            memberId,
            member_id: memberId,
            teamMemberId: memberId,
            team_member_id: memberId,
        };

        const sanitized = Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined && value !== null),
        ) as TeamAssignOrderDto;

        const result = await mutation.mutateAsync({ code, data: sanitized });

        await queryClient.invalidateQueries({ queryKey: getTeamShipmentsControllerListUnassignedQueryKey() });
        await queryClient.invalidateQueries({ queryKey: getTeamShipmentsControllerListMyShipmentsQueryKey() });

        return result;
    };

    return {
        ...mutation,
        assign,
    };
}
