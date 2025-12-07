'use client';

import {
    useAdminTeamsControllerList,
    useAdminTeamsControllerGet,
    useAdminTeamsControllerCreate,
    useAdminTeamsControllerUpdate,
    useAdminTeamsControllerAddMember,
    useAdminTeamsControllerRemoveMember,
    getAdminTeamsControllerListQueryKey,
    getAdminTeamsControllerGetQueryKey,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';

import type {
    AdminTeamsControllerListParams,
    AdminCreateTeamDto,
    AdminUpdateTeamDto,
    AdminAddTeamMemberDto,
} from '@/lib/api/generated/models';
import { useQueryClient } from '@tanstack/react-query';

// --- List Teams ---
export function useAdminTeamsList(params?: AdminTeamsControllerListParams) {
    return useAdminTeamsControllerList(params);
}

// --- Team Detail ---
export function useAdminTeamDetail(id: string) {
    return useAdminTeamsControllerGet(id, {
        query: { enabled: !!id },
    });
}

// --- Create Team ---
export function useCreateAdminTeam() {
    const queryClient = useQueryClient();
    const mutation = useAdminTeamsControllerCreate();

    return {
        ...mutation,
        mutateAsync: async (data: AdminCreateTeamDto) => {
            const result = await mutation.mutateAsync({ data });
            // Invalidate list
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerListQueryKey(),
            });
            return result;
        },
    };
}

// --- Update Team ---
export function useUpdateAdminTeam() {
    const queryClient = useQueryClient();
    const mutation = useAdminTeamsControllerUpdate();

    return {
        ...mutation,
        mutateAsync: async (args: { id: string; data: AdminUpdateTeamDto }) => {
            const result = await mutation.mutateAsync({ id: args.id, data: args.data });
            // Invalidate list and detail
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerListQueryKey(),
            });
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerGetQueryKey(args.id),
            });
            return result;
        },
    };
}

// --- Add Member ---
export function useAddTeamMember() {
    const queryClient = useQueryClient();
    const mutation = useAdminTeamsControllerAddMember();

    return {
        ...mutation,
        mutateAsync: async (args: { id: string; data: AdminAddTeamMemberDto }) => {
            const result = await mutation.mutateAsync({ id: args.id, data: args.data });
            // Invalidate detail to show new member
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerGetQueryKey(args.id),
            });
            return result;
        },
    };
}

// --- Remove Member ---
export function useRemoveTeamMember() {
    const queryClient = useQueryClient();
    const mutation = useAdminTeamsControllerRemoveMember();

    return {
        ...mutation,
        mutateAsync: async (args: { id: string; memberId: string }) => {
            const result = await mutation.mutateAsync({ id: args.id, memberId: args.memberId });
            // Invalidate detail to remove member from list
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerGetQueryKey(args.id),
            });
            return result;
        },
    };
}
