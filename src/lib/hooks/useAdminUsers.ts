'use client';

import {
    useAdminUsersControllerList,
    useAdminUsersControllerGetOne,
    useAdminUsersControllerCreate,
    useAdminUsersControllerUpdate,
    getAdminUsersControllerListQueryKey,
    getAdminUsersControllerGetOneQueryKey,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type {
    AdminCreateUserDto,
    AdminUpdateUserDto,
} from '@/lib/api/generated/models';
import { useQueryClient } from '@tanstack/react-query';

export function useAdminUsersList() {
    return useAdminUsersControllerList();
}

export function useAdminUserDetail(id: string) {
    return useAdminUsersControllerGetOne(id, {
        query: { enabled: !!id },
    });
}

export function useCreateAdminUser() {
    const queryClient = useQueryClient();
    const mutation = useAdminUsersControllerCreate();

    return {
        ...mutation,
        mutateAsync: async (data: AdminCreateUserDto) => {
            const result = await mutation.mutateAsync({ data });
            // Invalidate list
            await queryClient.invalidateQueries({
                queryKey: getAdminUsersControllerListQueryKey(),
            });
            return result;
        },
    };
}

export function useUpdateAdminUser() {
    const queryClient = useQueryClient();
    const mutation = useAdminUsersControllerUpdate();

    return {
        ...mutation,
        mutateAsync: async (args: { id: string; data: AdminUpdateUserDto }) => {
            const result = await mutation.mutateAsync({ id: args.id, data: args.data });
            // Invalidate list and detail
            await queryClient.invalidateQueries({
                queryKey: getAdminUsersControllerListQueryKey(),
            });
            await queryClient.invalidateQueries({
                queryKey: getAdminUsersControllerGetOneQueryKey(args.id),
            });
            return result;
        },
    };
}
