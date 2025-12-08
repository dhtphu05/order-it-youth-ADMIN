import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosBaseInstance } from '@/src/lib/api/axios';
import type {
  Team,
  TeamMember,
  PosQuickOrderDto,
  OrderResponse,
} from '@/src/lib/api/models/pos';

const POS_API_BASE = '/api';

/**
 * Hook to fetch list of active teams for POS
 * GET /api/pos/orders/teams
 */
export const useTeams = () => {
  return useQuery({
    queryKey: ['pos', 'teams'],
    queryFn: async (): Promise<Team[]> => {
      console.log('[Hook] Fetching teams...');
      const response = await axiosBaseInstance.get(`${POS_API_BASE}/pos/orders/teams`);
      console.log('[Hook] Teams fetched:', response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch members (shippers) of a specific team
 * GET /api/pos/orders/teams/:teamId/members
 */
export const useTeamMembers = (teamId?: string) => {
  return useQuery({
    queryKey: ['pos', 'teams', teamId, 'members'],
    queryFn: async (): Promise<TeamMember[]> => {
      if (!teamId) return [];
      console.log('[Hook] Fetching team members for:', teamId);
      const response = await axiosBaseInstance.get(
        `${POS_API_BASE}/pos/orders/teams/${teamId}/members`
      );
      console.log('[Hook] Team members fetched:', response.data);
      return response.data;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch team orders/statistics
 * GET /api/pos/teams/:teamId/orders
 */
export const useTeamOrders = (teamId?: string) => {
  return useQuery({
    queryKey: ['pos', 'teams', teamId, 'orders'],
    queryFn: async (): Promise<{ team_id: string; order_count: number; orders: any[] }> => {
      if (!teamId) return { team_id: '', order_count: 0, orders: [] };
      console.log('[Hook] Fetching team orders for:', teamId);
      const response = await axiosBaseInstance.get(
        `${POS_API_BASE}/pos/teams/${teamId}/orders`
      );
      console.log('[Hook] Team orders fetched:', response.data);
      return response.data;
    },
    enabled: !!teamId,
    staleTime: 1000 * 30, // 30 seconds - more frequent updates
  });
};

/**
 * Hook to create a quick order via POS
 * POST /api/pos/orders/quick
 */
export const useCreateQuickOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: PosQuickOrderDto): Promise<OrderResponse> => {
      console.log('[Hook] Creating quick order:', orderData);
      const response = await axiosBaseInstance.post(
        `${POS_API_BASE}/pos/orders/quick`,
        orderData,
        {
          // POS API does not require Authorization header
          headers: {
            Authorization: undefined,
          },
        }
      );
      console.log('[Hook] Order created:', response.data);
      return response.data;
    },
    onSuccess: (response, variables) => {
      console.log('[Hook] onSuccess - invalidating queries for team:', variables.team_id);
      // Invalidate all POS-related queries
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      // Also invalidate team-specific queries
      if (variables.team_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['pos', 'teams', variables.team_id] 
        });
      }
    },
  });
};
