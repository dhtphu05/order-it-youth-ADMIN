"use client"

import { useState } from "react"
import { Search, Eye, AlertCircle, CheckCircle2, Copy } from "lucide-react"

interface PendingOrder {
  id: string
  customerName: string
  customerPhone: string
  totalAmount: number
  expectedContent: string
  createdAt: string
  status: "CHỜ XÁC NHẬN" | "ĐÃ THANH TOÁN" | "CẦN KIỂM TRA"
}

interface PaymentLog {
  timestamp: string
  action: string
  performer: string
  note: string
}

export function AdminVietQRVerification() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([])

  // Mock pending orders
  const pendingOrders: PendingOrder[] = [
    {
      id: "ORDER_001",
      customerName: "Trần Nam",
      customerPhone: "0963xxxxxx",
      totalAmount: 85000,
      expectedContent: "ORDER_001 - TRAN NAM",
      createdAt: "10:35 - 05/11",
      status: "CHỜ XÁC NHẬN",
    },
    {
      id: "ORDER_002",
      customerName: "Nguyễn Minh",
      customerPhone: "0912xxxxxx",
      totalAmount: 150000,
      expectedContent: "ORDER_002 - NGUYEN MINH",
      createdAt: "11:20 - 05/11",
      status: "CHỜ XÁC NHẬN",
    },
    {
      id: "ORDER_003",
      customerName: "Phạm Huy",
      customerPhone: "0909xxxxxx",
      totalAmount: 120000,
      expectedContent: "ORDER_003 - PHAM HUY",
      createdAt: "09:45 - 05/11",
      status: "CẦN KIỂM TRA",
    },
  ]

  const filteredOrders = pendingOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "CHỜ XÁC NHẬN":
        return "bg-yellow-100 text-yellow-800"
      case "ĐÃ THANH TOÁN":
        return "bg-green-100 text-green-800"
      case "CẦN KIỂM TRA":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewOrder = (order: PendingOrder) => {
    setSelectedOrder(order)
    setPaymentLogs([
      {
        timestamp: "10:35 05/11",
        action: "Người dùng đặt hàng",
        performer: "User Trần Nam",
        note: "",
      },
    ])
    setShowDetailModal(true)
  }

  const handleConfirmPayment = () => {
    if (selectedOrder) {
      // Add log entry
      const newLog: PaymentLog = {
        timestamp: new Date().toLocaleString("vi-VN"),
        action: "Đã xác nhận thanh toán",
        performer: "Admin Huy",
        note: `Khớp số tiền ${selectedOrder.totalAmount.toLocaleString()}đ`,
      }
      setPaymentLogs([newLog, ...paymentLogs])
      alert(`✅ Đơn ${selectedOrder.id} đã được xác nhận thanh toán – ${selectedOrder.totalAmount.toLocaleString()}đ.`)
      setShowDetailModal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Người ủng hộ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Nội dung CK kỳ vọng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Thời gian đặt</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-mono font-bold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.totalAmount.toLocaleString()}đ</td>
                  <td className="px-6 py-4 text-sm font-mono text-cyan-600 truncate">{order.expectedContent}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.createdAt}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng & Xác nhận thanh toán</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">🧾 Thông tin đơn hàng</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Mã đơn</p>
                    <p className="font-mono font-bold text-gray-900">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Người ủng hộ</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Tổng tiền</p>
                    <p className="font-bold text-cyan-600">{selectedOrder.totalAmount.toLocaleString()}đ</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Trạng thái</p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(selectedOrder.status)}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 text-xs">Thời gian đặt</p>
                    <p className="text-gray-900">{selectedOrder.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* Expected Transfer Information */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">💰 Thông tin chuyển khoản kỳ vọng</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng</span>
                    <span className="font-medium text-gray-900">MB Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tài khoản</span>
                    <span className="font-mono font-medium text-gray-900">9704 xxxx xxxx</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chủ TK</span>
                    <span className="font-medium text-gray-900">CLB Tình nguyện CNTT</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600">Nội dung CK yêu cầu</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-cyan-600 text-right">
                        {selectedOrder.expectedContent}
                      </span>
                      <button className="p-1 hover:bg-gray-200 rounded transition" title="Sao chép">
                        <Copy className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền</span>
                    <span className="font-bold text-cyan-600">{selectedOrder.totalAmount.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              {/* Payment Verification Form */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">🧩 Đối chiếu giao dịch VietQR</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Nội dung CK thực tế</label>
                    <textarea
                      placeholder="VD: MB Bank +85.000đ từ TRAN NAM – ORDER_001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Số tiền nhận được</label>
                      <input
                        type="number"
                        placeholder="85000"
                        defaultValue={selectedOrder.totalAmount}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Thời gian giao dịch</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm">
                        <option>Hôm nay</option>
                        <option>Hôm qua</option>
                        <option>Tùy chọn</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Ghi chú nội bộ (tùy chọn)</label>
                    <textarea
                      placeholder="Đã xác nhận tiền vào, khớp nội dung CK"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      rows={2}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                    <span className="text-gray-700">Khớp nội dung & số tiền</span>
                  </label>
                </div>
              </div>

              {/* Payment Logs */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">📊 Lịch sử thanh toán</h4>
                <div className="space-y-3">
                  {paymentLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="text-gray-600 whitespace-nowrap min-w-[100px]">{log.timestamp}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{log.action}</p>
                        <p className="text-gray-600 text-xs">{log.performer}</p>
                        {log.note && <p className="text-gray-600 text-xs">{log.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmPayment}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Xác nhận đã nhận tiền
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Không khớp / Cần kiểm tra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
