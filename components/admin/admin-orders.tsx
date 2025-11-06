"use client"

import { useState } from "react"
import { Search, MoreVertical, Eye, Zap } from "lucide-react"

interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  totalAmount: number
  status: "pending" | "assigned" | "out_for_delivery" | "delivered" | "failed"
  shipperId?: string
  shipperName?: string
  createdAt: string
}

export function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const orders: Order[] = [
    {
      id: "order_1754_001",
      customerId: "cust_1",
      customerName: "Nguyễn Văn A",
      customerPhone: "0981234567",
      totalAmount: 95000,
      status: "pending",
      createdAt: "12/01/2024",
    },
    {
      id: "order_1754_002",
      customerId: "cust_2",
      customerName: "Trần Thị B",
      customerPhone: "0985678901",
      totalAmount: 150000,
      status: "assigned",
      shipperId: "shipper_1",
      shipperName: "Nguyễn Văn B",
      createdAt: "12/01/2024",
    },
    {
      id: "order_1754_003",
      customerId: "cust_3",
      customerName: "Lê Văn C",
      customerPhone: "0912345678",
      totalAmount: 75000,
      status: "delivered",
      shipperId: "shipper_1",
      shipperName: "Nguyễn Văn B",
      createdAt: "11/01/2024",
    },
    {
      id: "order_1754_004",
      customerId: "cust_4",
      customerName: "Phạm Thị D",
      customerPhone: "0909876543",
      totalAmount: 120000,
      status: "out_for_delivery",
      shipperId: "shipper_2",
      shipperName: "Trần Văn D",
      createdAt: "12/01/2024",
    },
  ]

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.customerPhone.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-pending"
      case "assigned":
        return "badge-assigned"
      case "out_for_delivery":
        return "badge-out-for-delivery"
      case "delivered":
        return "badge-delivered"
      case "failed":
        return "badge-failed"
      default:
        return "badge-pending"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Chưa gán",
      assigned: "Đã gán",
      out_for_delivery: "Đang giao",
      delivered: "Đã giao",
      failed: "Thất bại",
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chưa gán</option>
            <option value="assigned">Đã gán</option>
            <option value="out_for_delivery">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="failed">Thất bại</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Shipper</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.customerPhone}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.totalAmount.toLocaleString()}đ</td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadgeClass(order.status)}>{getStatusLabel(order.status)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.shipperName || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.createdAt}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowDetailModal(true)
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin khách hàng</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600">Tên:</span>{" "}
                    <span className="font-medium">{selectedOrder.customerName}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">SĐT:</span>{" "}
                    <span className="font-medium">{selectedOrder.customerPhone}</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Mã đơn</h4>
                <p className="text-sm font-mono text-gray-900">{selectedOrder.id}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Trạng thái</h4>
                <span className={getStatusBadgeClass(selectedOrder.status)}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipper</h4>
                <p className="text-sm text-gray-700">{selectedOrder.shipperName || "Chưa gán"}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Tổng tiền</h4>
                <p className="text-lg font-bold text-cyan-600">{selectedOrder.totalAmount.toLocaleString()}đ</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  Xem chi tiết
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4" />
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
