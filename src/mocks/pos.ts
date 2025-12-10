import { http, HttpResponse } from 'msw';

/**
 * Mock data for POS API endpoints
 */

export const MOCK_TEAMS = [
  {
    id: 'team-001',
    code: 'SALES-01',
    name: 'Team Bán Hàng 1',
  },
  {
    id: 'team-002',
    code: 'SALES-02',
    name: 'Team Bán Hàng 2',
  }
];

export const MOCK_TEAM_MEMBERS: Record<string, any[]> = {
  'team-001': [
    {
      id: 'member-001',
      full_name: 'Nguyễn Văn A',
      phone: '0909111222',
      role: 'SHIPPER',
    },
    {
      id: 'member-002',
      full_name: 'Trần Thị B',
      phone: '0908333444',
      role: 'SHIPPER',
    },
    {
      id: 'member-003',
      full_name: 'Lê Văn C',
      phone: '0907555666',
      role: 'MEMBER',
    },
  ],
  'team-002': [
    {
      id: 'member-004',
      full_name: 'Phạm Thị D',
      phone: '0906777888',
      role: 'SHIPPER',
    },
    {
      id: 'member-005',
      full_name: 'Hoàng Văn E',
      phone: '0905999000',
      role: 'SHIPPER',
    },
  ],
  'team-003': [
    {
      id: 'member-006',
      full_name: 'Vũ Thị F',
      phone: '0904111222',
      role: 'SHIPPER',
    },
  ],
};

/**
 * In-memory storage for orders
 * This simulates a database for development
 */
interface StoredOrder {
  id: string;
  code?: string;
  team_id: string;
  shipper_id?: string;
  items: any[];
  full_name?: string;
  phone?: string;
  address?: string;
  email?: string;
  payment_method: string;
  referrer_code?: string;
  order_status: string;
  payment_status: string;
  created_at: string;
  grand_total_vnd?: number;
}

// Store orders in memory
const orderStore: Map<string, StoredOrder> = new Map();

// Team statistics (orders per team)
const teamStats: Map<string, number> = new Map(MOCK_TEAMS.map(t => [t.id, 0]));

// Load persisted orders from sessionStorage (new orders created via quick-order)
const loadPersistedOrders = () => {
  try {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    const persisted = sessionStorage.getItem('pos_new_orders');
    if (persisted) {
      const newOrders: StoredOrder[] = JSON.parse(persisted);
      newOrders.forEach((order) => {
        orderStore.set(order.id, order);
        if (order.team_id) {
          teamStats.set(order.team_id, (teamStats.get(order.team_id) || 0) + 1);
        }
      });
      console.log('[MSW] Loaded persisted orders:', newOrders.length);
    }
  } catch (error) {
    console.error('[MSW] Error loading persisted orders:', error);
  }
};

// Save orders to sessionStorage
const persistOrders = () => {
  try {
    if (typeof window === 'undefined') return;
    
    const newOrders = Array.from(orderStore.values()).filter(
      o => o.id.startsWith('ORD-') && !o.id.match(/ORD-100\d/)
    );
    if (newOrders.length > 0) {
      sessionStorage.setItem('pos_new_orders', JSON.stringify(newOrders));
    }
  } catch (error) {
    console.error('[MSW] Error persisting orders:', error);
  }
};

// Initialize with mock orders for team-003
const initializeMockOrders = () => {
  const mockOrders: StoredOrder[] = [
    // {
    //   id: 'ORD-1001',
    //   code: '#001001',
    //   team_id: 'team-003',
    //   shipper_id: 'member-006',
    //   items: [
    //     { variant_id: 'var-001', quantity: 2, price_version: 50000 },
    //     { variant_id: 'var-002', quantity: 1, price_version: 100000 },
    //   ],
    //   full_name: 'Trần Văn Hùng',
    //   phone: '0912345678',
    //   address: 'Số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
    //   email: 'hung@example.com',
    //   payment_method: 'CASH',
    //   order_status: 'CREATED',
    //   payment_status: 'PENDING',
    //   created_at: new Date(Date.now() - 3600000).toISOString(),
    //   grand_total_vnd: 200000,
    // },
    // {
    //   id: 'ORD-1002',
    //   code: '#001002',
    //   team_id: 'team-003',
    //   shipper_id: 'member-006',
    //   items: [
    //     { variant_id: 'var-003', quantity: 3, price_version: 75000 },
    //   ],
    //   full_name: 'Lê Thị Mỹ Duyên',
    //   phone: '0987654321',
    //   address: 'Số 456 Đường Lê Lợi, Quận 3, TP.HCM',
    //   email: 'duyenlt@example.com',
    //   payment_method: 'TRANSFER',
    //   order_status: 'CREATED',
    //   payment_status: 'SUCCESS',
    //   created_at: new Date(Date.now() - 7200000).toISOString(),
    //   grand_total_vnd: 225000,
    // },
  ];
  
  mockOrders.forEach((order) => {
    orderStore.set(order.id, order);
    if (order.team_id) {
      teamStats.set(order.team_id, (teamStats.get(order.team_id) || 0) + 1);
    }
  });
  
  console.log('[MSW] Initialized mock orders:', orderStore.size);
};

initializeMockOrders();
loadPersistedOrders();

/**
 * POS API Mock Handlers
 */
export const posMockHandlers = [
  // GET /api/pos/orders/teams
  http.get('*/api/pos/orders/teams', () => {
    console.log('[MSW] GET /api/pos/orders/teams');
    return HttpResponse.json(MOCK_TEAMS, { status: 200 });
  }),

  // GET /api/pos/orders/teams/:teamId/members
  http.get('*/api/pos/orders/teams/:teamId/members', ({ params }) => {
    const { teamId } = params;
    console.log('[MSW] GET /api/pos/orders/teams/:teamId/members', { teamId });
    const members = MOCK_TEAM_MEMBERS[teamId as string] || [];
    return HttpResponse.json(members, { status: 200 });
  }),

  // POST /api/pos/orders/quick
  http.post('*/api/pos/orders/quick', async ({ request }) => {
    const body = (await request.json()) as any;
    console.log('[MSW] POST /api/pos/orders/quick', body);
    
    // Generate mock order ID
    const orderId = `ORD-${Date.now()}`;
    
    // Store order with full details for display in table
    const order: StoredOrder = {
      id: orderId,
      code: `#${Date.now().toString().slice(-6)}`, // Generate order code
      team_id: body.team_id,
      shipper_id: body.shipper_id,
      items: body.items,
      full_name: body.full_name || 'Khách vãng lai',
      phone: body.phone || '0000000000',
      address: body.address || 'Mua tại quầy',
      email: body.email,
      payment_method: body.payment_method,
      referrer_code: body.referrer_code,
      order_status: 'CREATED',
      payment_status: 'PENDING',
      created_at: new Date().toISOString(),
      grand_total_vnd: (body.items || []).reduce((sum: number, item: any) => {
        return sum + ((item.price_version || 0) * (item.quantity || 0));
      }, 0),
    };
    
    orderStore.set(orderId, order);
    
    // Update team stats
    if (body.team_id) {
      const currentCount = teamStats.get(body.team_id) || 0;
      teamStats.set(body.team_id, currentCount + 1);
      console.log('[MSW] Updated team stats:', Object.fromEntries(teamStats));
    }
    
    // Persist new order to sessionStorage
    persistOrders();
    
    return HttpResponse.json(
      {
        id: orderId,
        code: order.code,
        order_status: 'CREATED',
        payment_status: 'PENDING',
      },
      { status: 201 }
    );
  }),

  // GET /api/pos/orders (for statistics)
  http.get('*/api/pos/orders', () => {
    console.log('[MSW] GET /api/pos/orders - Total orders:', orderStore.size);
    const orders = Array.from(orderStore.values()).map(order => ({
      id: order.id,
      code: order.code || order.id,
      full_name: order.full_name || 'Khách vãng lai',
      phone: order.phone || '0000000000',
      payment_status: order.payment_status,
      order_status: order.order_status,
      grand_total_vnd: order.grand_total_vnd || 0,
      created_at: order.created_at,
      team_id: order.team_id,
      shipper_id: order.shipper_id,
      items: order.items,
    }));
    return HttpResponse.json(orders, { status: 200 });
  }),

  // GET /api/pos/teams/:teamId/orders (team statistics)
  http.get('*/api/pos/teams/:teamId/orders', ({ params }) => {
    const { teamId } = params;
    console.log('[MSW] GET /api/pos/teams/:teamId/orders', { teamId });
    const teamOrders = Array.from(orderStore.values()).filter(
      o => o.team_id === teamId
    );
    return HttpResponse.json(
      {
        team_id: teamId,
        order_count: teamOrders.length,
        orders: teamOrders,
      },
      { status: 200 }
    );
  }),
];

