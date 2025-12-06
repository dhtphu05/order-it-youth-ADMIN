'use client';

import {
    useAdminTeamsControllerList,
    useAdminTeamsControllerGet,
    useAdminTeamsControllerCreate,
    useAdminTeamsControllerUpdate,
    useAdminTeamsControllerDisable,
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

export function useAdminTeamsList(params?: AdminTeamsControllerListParams) {
    return useAdminTeamsControllerList(params);
}

export function useAdminTeamDetail(id: string) {
    return useAdminTeamsControllerGet(id, {
        query: { enabled: !!id },
    });
}

export function useCreateAdminTeam() {
    const queryClient = useQueryClient();
    const mutation = useAdminTeamsControllerCreate();

    return {
        ...mutation,
        mutateAsync: async (data: AdminCreateTeamDto) => {
            const result = await mutation.mutateAsync({ data });
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerListQueryKey(),
            });
            return result;
        },
    };
}

export function useUpdateAdminTeam() {
    const queryClient = useQueryClient();
    const mutation = useAdminTeamsControllerUpdate();

    return {
        ...mutation,
        mutateAsync: async (args: { id: string; data: AdminUpdateTeamDto }) => {
            const result = await mutation.mutateAsync({ id: args.id, data: args.data });
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

export function useDisableAdminTeam() {
    const queryClient = useQueryClient();
    const mutation = useAdminTeamsControllerDisable();

    return {
        ...mutation,
        mutateAsync: async (id: string) => {
            const result = await mutation.mutateAsync({ id });
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerListQueryKey(),
            });
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerGetQueryKey(id),
            });
            return result;
        },
    };
}

export function useAddMemberToTeam() {
    const queryClient = useQueryClient();
    const mutation = useAdminTeamsControllerAddMember();

    return {
        ...mutation,
        mutateAsync: async (args: { id: string; data: AdminAddTeamMemberDto }) => {
            const result = await mutation.mutateAsync({ id: args.id, data: args.data });
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerGetQueryKey(args.id),
            });
            return result;
        },
    };
}

export function useRemoveMemberFromTeam() {
    const queryClient = useQueryClient();
    const mutation = useAdminTeamsControllerRemoveMember();

    return {
        ...mutation,
        mutateAsync: async (args: { id: string; memberId: string }) => {
            const result = await mutation.mutateAsync({ id: args.id, memberId: args.memberId });
            await queryClient.invalidateQueries({
                queryKey: getAdminTeamsControllerGetQueryKey(args.id),
            });
            return result;
        },
    };
}
