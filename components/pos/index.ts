/**
 * POS Module Exports
 * Main entry point for POS components and hooks
 */

// Hooks
export { useTeams, useTeamMembers, useCreateQuickOrder } from '@/src/lib/hooks/usePos';

// Types
export type {
  Team,
  TeamMember,
  OrderItem,
  PosQuickOrderDto,
  OrderResponse,
} from '@/src/lib/api/models/pos';

// Components
export { QuickOrderForm } from '@/components/pos/quick-order-form';
export { QuickOrderCart } from '@/components/pos/quick-order-cart';
export type { CartItem } from '@/components/pos/quick-order-cart';

// UI Components
export { Container } from '@/components/ui/container';
