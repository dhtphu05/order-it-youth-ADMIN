'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosBaseInstance } from '@/src/lib/api/axios';

export type TeamOrdersListParams = {
    page?: number;
    limit?: number;
    q?: string;
    paymentStatus?: string;
    fulfillmentType?: string;
    from?: string;
    to?: string;
};

export type OrderItem = {
    id: string;
    code?: string;
    full_name?: string;
    phone?: string;
    payment_status: string;
    order_status: string;
    grand_total_vnd?: number;
    created_at?: string;
    items?: any[];
    team_id?: string;
    shipper_id?: string;
};

export type TeamOrdersListResponse = {
    data: OrderItem[];
    total: number;
    page: number;
    limit: number;
};

/**
 * Fetch team orders from POS API
 * GET /api/pos/orders
 */
export function useTeamOrdersList(params?: TeamOrdersListParams) {
    return useQuery({
        queryKey: ['pos', 'team', 'orders', params],
        queryFn: async (): Promise<TeamOrdersListResponse> => {
            console.log('[Hook] Fetching team orders:', params);
            
            try {
                // Fetch all orders from POS API
                const response = await axiosBaseInstance.get<OrderItem[]>('/api/pos/orders');
                let orders = response.data || [];
                
                console.log('[Hook] Orders fetched:', orders);
                
                // Filter by search query
                if (params?.q) {
                    const q = params.q.toLowerCase();
                    orders = orders.filter((order) =>
                        order.code?.toLowerCase().includes(q) ||
                        order.full_name?.toLowerCase().includes(q) ||
                        order.phone?.toLowerCase().includes(q)
                    );
                }
                
                // Filter by payment status
                if (params?.paymentStatus) {
                    orders = orders.filter((order) => 
                        order.payment_status === params.paymentStatus
                    );
                }
                
                // Filter by fulfillment type
                if (params?.fulfillmentType) {
                    orders = orders.filter((order) => 
                        (order as any).fulfillment_type === params.fulfillmentType
                    );
                }
                
                // Sort by created_at descending
                orders.sort((a, b) => {
                    const aDate = new Date(a.created_at || 0).getTime();
                    const bDate = new Date(b.created_at || 0).getTime();
                    return bDate - aDate;
                });
                
                // Pagination
                const page = params?.page || 1;
                const limit = params?.limit || 20;
                const start = (page - 1) * limit;
                const paginatedOrders = orders.slice(start, start + limit);
                
                console.log('[Hook] Paginated response:', {
                    total: orders.length,
                    page,
                    limit,
                    returned: paginatedOrders.length,
                });
                
                return {
                    data: paginatedOrders.map((order) => ({
                        ...order,
                        code: order.code || order.id,
                        grand_total_vnd: order.grand_total_vnd || 0,
                    })),
                    total: orders.length,
                    page,
                    limit,
                };
            } catch (error) {
                console.error('[Hook] Error fetching team orders:', error);
                throw error;
            }
        },
        staleTime: 1000 * 30, // 30 seconds
    });
}

/**
 * Get single order detail
 * Currently not implemented - can be added later
 */
export function useTeamOrderDetail(code: string) {
    return useQuery({
        queryKey: ['pos', 'orders', code],
        queryFn: async (): Promise<OrderItem | null> => {
            console.log('[Hook] Fetching order detail:', code);
            try {
                const response = await axiosBaseInstance.get<OrderItem[]>('/api/pos/orders');
                const order = response.data?.find(o => o.code === code || o.id === code);
                console.log('[Hook] Order detail:', order);
                return order || null;
            } catch (error) {
                console.error('[Hook] Error fetching order detail:', error);
                throw error;
            }
        },
        enabled: !!code,
        staleTime: 1000 * 30,
    });
}
