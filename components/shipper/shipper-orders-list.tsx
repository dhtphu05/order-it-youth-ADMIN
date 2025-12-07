'use client';

import { useState } from 'react';
import { Phone, MapPin, CheckCircle, AlertCircle, Truck, MoreVertical, Package } from 'lucide-react';
import {
  useUnassignedShipments,
  useMyShipments,
  useAssignOrderToSelf,
  useStartDelivery,
  useMarkDelivered,
} from '@/src/lib/hooks/useTeamShipments';
import type { OrderResponseDto } from '@/lib/api/generated/models';

interface ShipperOrdersListProps {
  searchQuery: string;
  statusFilter: string;
}

export function ShipperOrdersList({ searchQuery, statusFilter }: ShipperOrdersListProps) {
  const [activeTab, setActiveTab] = useState<'unassigned' | 'my'>('unassigned');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Queries
  const unassignedQuery = useUnassignedShipments();
  const myShipmentsQuery = useMyShipments();

  // Mutations
  const assignSelf = useAssignOrderToSelf();
  const startDelivery = useStartDelivery();
  const markDelivered = useMarkDelivered();
  // useMarkFailed is more complex (needs reason), implementing basic version or prompt
  // For now we'll stick to basic actions or add it if requested. 
  // The previous code used prompt() for reason.

  // Handle potential response structure (Array vs { data: Array })
  const rawUnassigned = unassignedQuery.data;
  const rawMy = myShipmentsQuery.data;

  // Helper to extract array
  const getList = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const currentList = activeTab === 'unassigned' ? getList(rawUnassigned) : getList(rawMy);
  const isLoading = activeTab === 'unassigned' ? unassignedQuery.isLoading : myShipmentsQuery.isLoading;

  // Filter Logic
  const filteredOrders = currentList.filter((order: any) => {
    const matchesSearch =
      (order.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.phone || '').includes(searchQuery) ||
      (order.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter applies mainly to "My Shipments" since Unassigned are implicitly "PENDING" or "ASSIGNED" (but no shipper).
    // Actually, unassigned usually means they are ready to be taken.
    // For My Shipments, we check the order status or shipment status.
    // The UI filter had: all, assigned, out_for_delivery, delivered.
    // We'll match against order_status for now.
    const matchesStatus = statusFilter === 'all' ||
      (order.order_status || '').toLowerCase() === statusFilter ||
      (statusFilter === 'assigned' && order.order_status === 'DELIVERING'); // Example mapping

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-cyan-100 text-cyan-800';
      case 'DELIVERING':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': // or SUCCESS
        return 'bg-green-100 text-green-800';
      case 'FAILED': // or CANCELLED
        return 'bg-red-100 text-red-800';
      default:
        // Default for 'PENDING' etc
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      ASSIGNED: 'Đã gán',
      DELIVERING: 'Đang giao',
      DELIVERED: 'Đã giao',
      SUCCESS: 'Thành công',
      FAILED: 'Thất bại',
      PENDING: 'Chờ xử lý',
      CANCELLED: 'Đã hủy',
    };
    return labels[status || ''] || status || 'N/A';
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('unassigned')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'unassigned'
            ? 'border-cyan-500 text-cyan-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Đơn chưa nhận
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'my'
            ? 'border-cyan-500 text-cyan-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Đơn của tôi
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <div className="flex justify-center mb-4">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-600">
            Không tìm thấy đơn hàng nào.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.code}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition cursor-pointer"
              onClick={() => {
                setSelectedOrder(order);
                setShowDetailModal(true);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.full_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Mã đơn: {order.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.order_status)}`}>
                    {getStatusLabel(order.order_status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-cyan-600 flex-shrink-0 mt-1" />
                  {/* Assuming address is not on DTO top level based on check, using placeholder or checking notes */}
                  <p>{(order as any).address || (order as any).shipping_address || "Địa chỉ chưa cập nhật"}</p>
                </div>
              </div>

              {/* Actions for Unassigned Tab */}
              {activeTab === 'unassigned' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Bạn có chắc muốn nhận đơn này?')) {
                        assignSelf.mutateAsync(order.code);
                      }
                    }}
                    disabled={assignSelf.isPending}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition"
                  >
                    Nhận đơn ngay
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Khách hàng</h4>
                <div className="text-sm">
                  <p className="font-medium">{selectedOrder.full_name}</p>
                  <p className="text-gray-600">{selectedOrder.phone}</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Địa chỉ</h4>
                <p className="text-sm text-gray-700">{(selectedOrder as any).address || "N/A"}</p>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Sản phẩm</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx}>
                      {(item as any).title || "Product"} <span className="text-gray-600">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions (Only for My Shipments) */}
              {activeTab === 'my' && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  {/* Start Delivery: Check if status allows (e.g. ASSIGNED) */}
                  {/* Simplified check: button available if not final */}
                  <button
                    onClick={() => {
                      startDelivery.mutateAsync({ code: selectedOrder.code, data: {} });
                      setShowDetailModal(false);
                    }}
                    disabled={startDelivery.isPending}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Bắt đầu giao
                  </button>

                  <button
                    onClick={() => {
                      markDelivered.mutateAsync(selectedOrder.code);
                      setShowDetailModal(false);
                    }}
                    disabled={markDelivered.isPending}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Đã giao hàng
                  </button>
                </div>
              )}

              {/* Action for Unassigned in Modal */}
              {activeTab === 'unassigned' && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      assignSelf.mutateAsync(selectedOrder.code);
                      setShowDetailModal(false);
                    }}
                    disabled={assignSelf.isPending}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition"
                  >
                    Nhận đơn ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
