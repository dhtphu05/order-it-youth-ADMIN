/**
 * POS Module Type Definitions
 * Public POS API for Quick Order feature
 */

export interface Team {
  id: string;
  code: string;
  name: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  phone: string;
  role: string;
}

export interface OrderItem {
  variant_id: string;
  quantity: number;
  price_version: number;
}

export interface PosQuickOrderDto {
  items: OrderItem[];
  team_id?: string; // Optional but recommended
  shipper_id?: string; // Optional: Assigns shipment to this user
  full_name?: string; // Optional: Defaults to "Khách vãng lai"
  phone?: string; // Optional: Defaults to "0000000000"
  address?: string; // Optional: Defaults to "Mua tại quầy"
  email?: string; // Optional
  payment_method?: "CASH" | "TRANSFER"; // Default: CASH
  referrer_code?: string; // Optional
}

export interface OrderResponse {
  id: string;
  order_status: "CREATED" | "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  payment_status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  shipment?: {
    assigned_user_id?: string;
    status?: string;
  };
  [key: string]: unknown;
}
