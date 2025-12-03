/**
 * Custom API wrapper hooks for admin products
 * 
 * This file wraps Orval-generated hooks to provide a clean abstraction layer.
 * UI components should use these custom hooks instead of calling Orval hooks directly.
 */

import {
  useAdminProductsControllerList,
  useAdminProductsControllerGet,
  useAdminProductsControllerCreate,
  useAdminProductsControllerUpdate,
  useAdminProductsControllerRemove,
} from '../api/generated/endpoints/orderITYouthAdminAPI';
import type { AdminProductsControllerListParams } from '../api/generated/models/adminProductsControllerListParams';

/**
 * Hook for listing admin products with pagination and search
 * Wraps GET /admin/products
 */
export function useAdminProductsList(params?: AdminProductsControllerListParams) {
  const query = useAdminProductsControllerList(params);

  return {
    ...query,
    products: (query.data as any)?.data ?? [],
    pagination: query.data
      ? {
          total: (query.data as any).total,
          page: (query.data as any).page,
          limit: (query.data as any).limit,
        }
      : null,
  };
}

/**
 * Hook for getting a single product detail
 * Wraps GET /admin/products/{id}
 */
export function useAdminProductDetail(id?: string) {
  const query = useAdminProductsControllerGet(id as string, {
    query: {
      enabled: !!id,
    },
  });

  return {
    ...query,
    product: query.data ?? null,
  };
}

/**
 * Hook for creating a new product
 * Wraps POST /admin/products
 */
export function useAdminProductCreate() {
  const mutation = useAdminProductsControllerCreate();
  return {
    ...mutation,
    createProduct: mutation.mutateAsync,
  };
}

/**
 * Hook for updating an existing product
 * Wraps PATCH /admin/products/{id}
 */
export function useAdminProductUpdate() {
  const mutation = useAdminProductsControllerUpdate();
  return {
    ...mutation,
    updateProduct: mutation.mutateAsync,
  };
}

/**
 * Hook for deleting a product
 * Wraps DELETE /admin/products/{id}
 */
export function useAdminProductDelete() {
  const mutation = useAdminProductsControllerRemove();
  return {
    ...mutation,
    deleteProduct: mutation.mutateAsync,
  };
}

export {
  useAdminProductsList as default,
};
