/**
 * Custom API wrapper hooks for VietQR admin actions
 * 
 * This file wraps Orval-generated hooks to provide a clean abstraction layer.
 * UI components should use these custom hooks instead of calling Orval hooks directly.
 */

import {
  usePaymentsControllerConfirm,
  useBankTransactionsControllerManualCreate,
  useAdminOrdersControllerList,
} from '../api/generated/endpoints/orderITYouthAdminAPI';

/**
 * Hook for confirming payment manually
 * Wraps POST /payments/confirm
 */
export function useConfirmPayment() {
  const mutation = usePaymentsControllerConfirm();
  return {
    confirmPayment: mutation.mutateAsync,
    ...mutation,
  };
}

/**
 * Hook for manually creating a bank transaction
 * Wraps POST /bank-transactions/manual-create
 */
export function useCreateBankTransaction() {
  const mutation = useBankTransactionsControllerManualCreate();
  return {
    createBankTransaction: mutation.mutateAsync,
    ...mutation,
  };
}

/**
 * Hook for fetching pending VietQR orders
 * Wraps GET /admin/orders with paymentStatus=PENDING filter
 */
export function usePendingVietQrOrders() {
  const query = useAdminOrdersControllerList({
    paymentStatus: 'PENDING',
  });

  return {
    ...query,
    pendingOrders: (query.data as any)?.data ?? [],
  };
}
