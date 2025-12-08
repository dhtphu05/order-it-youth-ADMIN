/**
 * POS Feature Testing Guide
 * 
 * This file provides examples and test cases for the POS Quick Order feature
 */

import type {
  Team,
  TeamMember,
  OrderItem,
  PosQuickOrderDto,
  OrderResponse,
} from '@/src/lib/api/models/pos';

/**
 * MOCK DATA FOR TESTING
 */

// Sample Teams
export const MOCK_TEAMS: Team[] = [
  {
    id: 'team-001',
    code: 'SALES-01',
    name: 'Team 1 (Sales)',
  },
  {
    id: 'team-002',
    code: 'SALES-02',
    name: 'Team 2 (Sales)',
  },
  {
    id: 'team-003',
    code: 'RETAIL-01',
    name: 'Retail Team',
  },
];

// Sample Team Members
export const MOCK_TEAM_MEMBERS: Record<string, TeamMember[]> = {
  'team-001': [
    {
      id: 'member-001',
      full_name: 'Nguyen Van Shipper',
      phone: '0909000111',
      role: 'MEMBER',
    },
    {
      id: 'member-002',
      full_name: 'Tran Thi Delivery',
      phone: '0908888222',
      role: 'MEMBER',
    },
  ],
  'team-002': [
    {
      id: 'member-003',
      full_name: 'Le Van Worker',
      phone: '0907777333',
      role: 'MEMBER',
    },
  ],
  'team-003': [
    {
      id: 'member-004',
      full_name: 'Pham Thi Retail',
      phone: '0906666444',
      role: 'MEMBER',
    },
  ],
};

// Sample Order Items
export const MOCK_ORDER_ITEMS: OrderItem[] = [
  {
    variant_id: 'variant-001',
    quantity: 2,
    price_version: 1715432000,
  },
  {
    variant_id: 'variant-002',
    quantity: 1,
    price_version: 1715432000,
  },
];

/**
 * TEST CASES
 */

/**
 * Test Case 1: Minimal Order Creation
 * Required fields only
 */
export const TEST_CASE_1_MINIMAL: PosQuickOrderDto = {
  items: MOCK_ORDER_ITEMS,
  team_id: 'team-001',
  // All other fields optional, will use defaults
};

/**
 * Test Case 2: Full Order Creation
 * All fields provided
 */
export const TEST_CASE_2_FULL: PosQuickOrderDto = {
  items: MOCK_ORDER_ITEMS,
  team_id: 'team-001',
  shipper_id: 'member-001',
  full_name: 'Nguyen Van A',
  phone: '0912345678',
  address: '123 Nguyen Hue, District 1, HCMC',
  email: 'customer@example.com',
  payment_method: 'CASH',
  referrer_code: 'REF001',
};

/**
 * Test Case 3: Order with Transfer Payment
 */
export const TEST_CASE_3_TRANSFER: PosQuickOrderDto = {
  items: MOCK_ORDER_ITEMS,
  team_id: 'team-002',
  shipper_id: 'member-003',
  full_name: 'Tran Thi B',
  phone: '0987654321',
  address: '456 Le Loi, District 2, HCMC',
  payment_method: 'TRANSFER',
};

/**
 * Test Case 4: Order without Shipper Assignment
 */
export const TEST_CASE_4_NO_SHIPPER: PosQuickOrderDto = {
  items: MOCK_ORDER_ITEMS,
  team_id: 'team-003',
  // shipper_id intentionally omitted
};

/**
 * Test Case 5: Order with Custom Items
 */
export const TEST_CASE_5_CUSTOM_ITEMS: PosQuickOrderDto = {
  items: [
    {
      variant_id: 'product-uuid-123',
      quantity: 5,
      price_version: 1715432000,
    },
    {
      variant_id: 'product-uuid-456',
      quantity: 3,
      price_version: 1715432000,
    },
    {
      variant_id: 'product-uuid-789',
      quantity: 1,
      price_version: 1715432000,
    },
  ],
  team_id: 'team-001',
  full_name: 'Pham Thi C',
  phone: '0911111111',
};

/**
 * EXPECTED RESPONSES
 */

export const EXPECTED_SUCCESS_RESPONSE: OrderResponse = {
  id: 'order-uuid-12345',
  order_status: 'CREATED',
  payment_status: 'PENDING',
  shipment: {
    assigned_user_id: 'member-001',
    status: 'PENDING',
  },
};

/**
 * ERROR TEST CASES
 */

/**
 * Error Test 1: Empty Items Array
 * Should return 400 Bad Request
 */
export const ERROR_TEST_1_EMPTY_ITEMS: PosQuickOrderDto = {
  items: [], // INVALID - Empty items
  team_id: 'team-001',
};

/**
 * Error Test 2: Missing Team ID
 * Should work but with fallback team assignment
 */
export const ERROR_TEST_2_NO_TEAM: Omit<PosQuickOrderDto, 'team_id'> & {
  team_id?: string;
} = {
  items: MOCK_ORDER_ITEMS,
  // team_id intentionally omitted
};

/**
 * Error Test 3: Invalid Shipper ID
 * Should return 404 Not Found
 */
export const ERROR_TEST_3_INVALID_SHIPPER: PosQuickOrderDto = {
  items: MOCK_ORDER_ITEMS,
  team_id: 'team-001',
  shipper_id: 'invalid-shipper-uuid', // INVALID - Doesn't exist
};

/**
 * Error Test 4: Invalid Email Format
 * Should return 422 Unprocessable Entity
 */
export const ERROR_TEST_4_INVALID_EMAIL: PosQuickOrderDto = {
  items: MOCK_ORDER_ITEMS,
  team_id: 'team-001',
  email: 'not-a-valid-email', // INVALID - Bad format
};

/**
 * Error Test 5: Shipper Not in Team
 * Should return 400 Bad Request
 */
export const ERROR_TEST_5_SHIPPER_NOT_IN_TEAM: PosQuickOrderDto = {
  items: MOCK_ORDER_ITEMS,
  team_id: 'team-001',
  shipper_id: 'member-003', // INVALID - This member is in team-002, not team-001
};

/**
 * TESTING CHECKLIST
 */

export const TESTING_CHECKLIST = {
  api_connectivity: [
    '[ ] Can reach /api/pos/orders/teams',
    '[ ] Can reach /api/pos/orders/teams/:teamId/members',
    '[ ] Can reach /api/pos/orders/quick',
    '[ ] No CORS errors in console',
  ],
  
  component_rendering: [
    '[ ] QuickOrderCart renders without errors',
    '[ ] QuickOrderForm renders without errors',
    '[ ] Dialog for adding items opens/closes',
    '[ ] Teams dropdown shows all teams',
    '[ ] Members dropdown shows correct team members',
  ],
  
  cart_functionality: [
    '[ ] Can add product to cart',
    '[ ] Can modify quantity in cart',
    '[ ] Can remove product from cart',
    '[ ] Cart item count updates correctly',
    '[ ] Duplicate products can be added separately',
  ],
  
  form_validation: [
    '[ ] Team selection is required',
    '[ ] Team selection error shows if omitted',
    '[ ] Members load after team selection',
    '[ ] Email validation works',
    '[ ] Phone number accepts valid formats',
    '[ ] Address field accepts long text',
  ],
  
  form_submission: [
    '[ ] Form validation prevents empty cart',
    '[ ] Form validation prevents missing team',
    '[ ] Spinner shows during submission',
    '[ ] Success toast shows after order creation',
    '[ ] Error toast shows on failure',
  ],
  
  navigation: [
    '[ ] After success, redirects to success page',
    '[ ] Success page shows order ID',
    '[ ] Can copy order ID from success page',
    '[ ] Back button works on quick order page',
    '[ ] Can create another order from success page',
  ],
  
  error_scenarios: [
    '[ ] Handles teams API failure gracefully',
    '[ ] Handles members API failure gracefully',
    '[ ] Handles order creation API failure gracefully',
    '[ ] Shows meaningful error messages',
    '[ ] Can retry after error',
  ],
};

/**
 * MANUAL TEST SCRIPT
 */

export const MANUAL_TEST_SCRIPT = `
1. SETUP
   - Start the application: npm run dev
   - Open browser to http://localhost:3000/pos/quick-order
   - Open DevTools Console (F12)

2. TEST TEAMS LOADING
   - Page should load without errors
   - Teams dropdown should show at least 3 teams
   - Check console for API request logs

3. TEST ADDING PRODUCTS
   - Click "Thêm Sản Phẩm"
   - Dialog should open
   - Enter product name: "Test Product"
   - Enter variant ID: "550e8400-e29b-41d4-a716-446655440000"
   - Set quantity: 2
   - Click "Thêm"
   - Product should appear in table
   - Try adding 2-3 more products

4. TEST TEAM SELECTION
   - Click teams dropdown
   - Select first team
   - Members dropdown should appear
   - Members should load for selected team
   - Should see 2+ team members

5. TEST SHIPPER SELECTION
   - Select a shipper from dropdown
   - Selection should be remembered

6. TEST CUSTOMER INFO
   - Fill in Name: "Test Customer"
   - Fill in Phone: "0912345678"
   - Fill in Email: "test@example.com"
   - Fill in Address: "123 Test Street"
   - Select Payment: "CASH"

7. TEST FORM SUBMISSION
   - Click "Tạo Đơn Hàng"
   - Button should show loading spinner
   - After ~2-5 seconds, should redirect
   - Success page should show
   - Order ID should be visible

8. TEST SUCCESS PAGE
   - Check order ID displays
   - Click copy icon next to order ID
   - Notification should show "Đã sao chép"
   - Try clicking "Tạo Đơn Hàng Khác"
   - Should return to quick order page with empty cart

9. TEST ERROR SCENARIOS
   - Try submitting with empty cart: Should show error
   - Try submitting without team: Should show validation error
   - Disable network and try to load teams: Should show error
   - Fill invalid email and submit: Should show validation error
`;

/**
 * BROWSER CONSOLE COMMANDS FOR TESTING
 */

export const CONSOLE_COMMANDS = {
  logState: `
    // In browser console:
    
    // Check local state of cart
    localStorage.getItem('pos-cart')
    
    // Get current page URL
    window.location.pathname
    
    // Simulate API delay
    localStorage.setItem('api-delay', '3000')
  `,

  mockApiResponse: `
    // Intercept fetch to mock responses
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      if (args[0].includes('/pos/orders/teams')) {
        return Promise.resolve(
          new Response(JSON.stringify([
            { id: 'test-1', code: 'T1', name: 'Test Team 1' }
          ]), { status: 200 })
        );
      }
      return originalFetch.apply(this, args);
    };
  `,

  testApiCall: `
    // Test API endpoints directly
    
    // Get Teams
    fetch('/api/pos/orders/teams')
      .then(r => r.json())
      .then(data => console.log('Teams:', data))
      .catch(e => console.error('Error:', e));
    
    // Get Team Members
    fetch('/api/pos/orders/teams/team-001/members')
      .then(r => r.json())
      .then(data => console.log('Members:', data))
      .catch(e => console.error('Error:', e));
    
    // Create Order
    fetch('/api/pos/orders/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variant_id: 'test', quantity: 1, price_version: 123 }],
        team_id: 'team-001',
        full_name: 'Test'
      })
    })
      .then(r => r.json())
      .then(data => console.log('Order:', data))
      .catch(e => console.error('Error:', e));
  `,
};

/**
 * PERFORMANCE METRICS TO MONITOR
 */

export const PERFORMANCE_METRICS = {
  targets: {
    teamLoadTime: '< 500ms',
    memberLoadTime: '< 500ms',
    orderCreationTime: '< 2s',
    pageLoadTime: '< 3s',
    interactionDelay: '< 100ms',
  },

  monitoring: `
    1. Open DevTools > Performance tab
    2. Click Record
    3. Perform user action
    4. Click Stop
    5. Analyze timeline for:
       - API request duration
       - Component render time
       - Total page interaction time
  `,
};

export {};
