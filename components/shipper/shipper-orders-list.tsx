"use client"

import { useState } from "react"
import { Phone, MapPin, CheckCircle, AlertCircle, Truck, MoreVertical } from "lucide-react"

interface Order {
  id: string
  customerName: string
  customerPhone: string
  address: string
  status: "assigned" | "out_for_delivery" | "delivered" | "failed"
  createdAt: string
  products: { name: string; quantity: number }[]
  notes?: string
}

interface ShipperOrdersListProps {
  searchQuery: string
  statusFilter: string
}

export function ShipperOrdersList({ searchQuery, statusFilter }: ShipperOrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [orderUpdates, setOrderUpdates] = useState<Record<string, string>>({})

  const mockOrders: Order[] = [
    {
      id: "order_1754_002",
      customerName: "Trần Thị B",
      customerPhone: "0985678901",
      address: "45 Lê Duẩn, Hải Châu, Đà Nẵng",
      status: "out_for_delivery",
      createdAt: "12/01/2024",
      products: [
        { name: "Sản phẩm A", quantity: 2 },
        { name: "Sản phẩm B", quantity: 1 },
      ],
      notes: "Giao giờ hành chính",
    },
    {
      id: "order_1754_004",
      customerName: "Phạm Thị D",
      customerPhone: "0909876543",
      address: "123 Nguyễn Chí Thanh, Thanh Khê, Đà Nẵng",
      status: "assigned",
      createdAt: "12/01/2024",
      products: [{ name: "Sản phẩm C", quantity: 1 }],
    },
  ]

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.customerPhone.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-cyan-100 text-cyan-800"
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      assigned: "Được gán",
      out_for_delivery: "Đang giao",
      delivered: "Đã giao",
      failed: "Không liên lạc",
    }
    return labels[status] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "out_for_delivery":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrderUpdates((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }))

    setTimeout(() => {
      setShowDetailModal(false)
      alert("Cập nhật trạng thái thành công!")
    }, 500)
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
        <div className="flex justify-center mb-4">
          <Truck className="h-12 w-12 text-gray-300" />
        </div>
        <p className="text-lg font-medium text-gray-600">
          Bạn chưa có đơn được phân công {statusFilter !== "all" ? "trong trạng thái này" : "hôm nay"} 💙
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition cursor-pointer"
            onClick={() => {
              setSelectedOrder(order)
              setShowDetailModal(true)
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{order.customerName}</h3>
                <p className="text-sm text-gray-600 mt-1">Mã đơn: {order.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                    order.status,
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {getStatusLabel(order.status)}
                </span>
                <button onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                <a href={`tel:${order.customerPhone}`} className="hover:text-cyan-600 hover:underline">
                  {order.customerPhone}
                </a>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin className="h-4 w-4 text-cyan-600 flex-shrink-0 mt-1" />
                <div>
                  <p>{order.address}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:underline text-sm"
                  >
                    Mở Google Maps
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {order.products.map((p) => `${p.name} (x${p.quantity})`).join(", ")}
              </p>
            </div>
          </div>
        ))}
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
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Khách hàng</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Tên:</span>{" "}
                    <span className="font-medium">{selectedOrder.customerName}</span>
                  </p>
                  <p>
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="text-cyan-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {selectedOrder.customerPhone}
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Địa chỉ giao hàng</h4>
                <p className="text-sm text-gray-700 mb-2">{selectedOrder.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedOrder.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 hover:underline text-sm flex items-center gap-1"
                >
                  <MapPin className="h-4 w-4" />
                  Mở Google Maps
                </a>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Sản phẩm</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  {selectedOrder.products.map((p, i) => (
                    <li key={i}>
                      {p.name} <span className="text-gray-600">x{p.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Trạng thái hiện tại</h4>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                    selectedOrder.status,
                  )}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ghi chú</h4>
                  <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-gray-200">
                {selectedOrder.status !== "delivered" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Đã giao hàng
                  </button>
                )}
                {selectedOrder.status !== "failed" && (
                  <button
                    onClick={() => {
                      const reason = prompt("Lý do không liên lạc được:")
                      if (reason) {
                        handleUpdateStatus(selectedOrder.id, "failed")
                      }
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Không liên lạc được
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
