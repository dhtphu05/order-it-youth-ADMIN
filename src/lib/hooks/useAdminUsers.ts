'use client';

import {
    useAdminUsersControllerCreate,
    useAdminUsersControllerGetOne,
    useAdminUsersControllerUpdate,
    getAdminUsersControllerListQueryKey,
} from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type {
    AdminCreateUserDto,
    AdminUpdateUserDto,
} from '@/lib/api/generated/models';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customInstance } from '@/lib/api/custom-instance';

// --- Manual Types (Fixing generated code gaps) ---

export interface AdminUsersControllerListParams {
    page?: number;
    limit?: number;
    q?: string;
    role?: 'ADMIN' | 'STAFF' | 'SHIPPER';
}

export interface AdminUserResponseDto {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    role: 'ADMIN' | 'STAFF' | 'SHIPPER';
    created_at: string;
    updated_at: string;
}

export interface AdminUserListResponse {
    data: AdminUserResponseDto[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

// --- Hooks ---

export function useAdminUsersList(params?: AdminUsersControllerListParams) {
    return useQuery({
        queryKey: [...getAdminUsersControllerListQueryKey(), params],
        queryFn: ({ signal }) =>
            customInstance<AdminUserListResponse>({
                url: '/api/admin/users',
                method: 'GET',
                params,
                signal,
            }),
    });
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
            // @ts-ignore: Generated types for DTO might be loose, but we pass what we have
            const result = await mutation.mutateAsync({ data });
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
            await queryClient.invalidateQueries({
                queryKey: getAdminUsersControllerListQueryKey(),
            });
            return result;
        },
    };
}
