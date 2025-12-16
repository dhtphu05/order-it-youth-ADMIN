'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customInstance } from '@/lib/api/custom-instance';

export type DonationPaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface AdminDonationListParams {
  page?: number;
  limit?: number;
  mssv?: string;
  status?: DonationPaymentStatus;
  startDate?: string;
  endDate?: string;
}

export interface AdminDonation {
  id: string;
  donation_code: string;
  student_name: string;
  student_class?: string;
  mssv: string;
  phone?: string;
  amount: number;
  payment_status: DonationPaymentStatus;
  pvcd_points?: number | null;
  created_at: string;
  confirmed_at?: string | null;
}

export interface AdminDonationListResponse {
  data: AdminDonation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ConfirmDonationResponse {
  id: string;
  payment_status: DonationPaymentStatus;
  pvcd_points: number;
  confirmed_at: string;
}

export interface DeleteDonationResponse {
  success: boolean;
  message?: string;
}

const ADMIN_DONATIONS_QUERY_KEY = 'admin-donations';

export const getAdminDonationsQueryKey = (params?: AdminDonationListParams) => [
  ADMIN_DONATIONS_QUERY_KEY,
  params ?? {},
];

export function useAdminDonationsList(params?: AdminDonationListParams) {
  return useQuery<AdminDonationListResponse, Error>({
    queryKey: getAdminDonationsQueryKey(params),
    queryFn: ({ signal }) =>
      customInstance<AdminDonationListResponse>({
        url: '/api/admin/donations',
        method: 'GET',
        params,
        signal,
      }),
    placeholderData: (previousData) => previousData,
  });
}

export function useConfirmDonation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      customInstance<ConfirmDonationResponse>({
        url: `/api/admin/donations/${id}/confirm`,
        method: 'POST',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [ADMIN_DONATIONS_QUERY_KEY],
      });
    },
  });

  return {
    ...mutation,
    confirmDonation: (id: string) => mutation.mutateAsync({ id }),
  };
}

export function useDeleteDonation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      customInstance<DeleteDonationResponse>({
        url: `/api/admin/donations/${id}`,
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [ADMIN_DONATIONS_QUERY_KEY],
      });
    },
  });

  return {
    ...mutation,
    deleteDonation: (id: string) => mutation.mutateAsync({ id }),
  };
}
