"use client"

import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Eye, Search } from "lucide-react"

import { useConfirmPayment, useCreateBankTransaction, usePendingVietQrOrders } from "@/lib/hooks/useVietQrAdmin"

export function AdminVietQRVerification() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [amountReceived, setAmountReceived] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [referenceNote, setReferenceNote] = useState("")
  const [isMatched, setIsMatched] = useState(true)

  const { pendingOrders, isLoading: pendingLoading } = usePendingVietQrOrders()
  const { confirmPayment, isLoading: confirmLoading } = useConfirmPayment()
  const { createBankTransaction, isLoading: bankTxLoading } = useCreateBankTransaction()

  const filteredOrders = useMemo(() => {
    return pendingOrders.filter(
      (order: any) =>
        order.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [pendingOrders, searchQuery])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
      case "CHỜ XÁC NHẬN":
        return "bg-yellow-100 text-yellow-800"
      case "SUCCESS":
      case "ĐÃ THANH TOÁN":
        return "bg-green-100 text-green-800"
      case "FAILED":
      case "CẦN KIỂM TRA":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setAmountReceived(order.grand_total_vnd?.toString() || "0")
    setTransactionId(order.code || "")
    setReferenceNote("")
    setIsMatched(true)
    setShowDetailModal(true)
  }

  async function onConfirmPayment(payload: any) {
    await confirmPayment(payload)

    const bankTxPayload = {
      data: {
        amount_vnd: payload.data.amount_vnd,
        occurred_at: payload.data.paid_at || new Date().toISOString(),
        transaction_id: payload.data.transaction_id || payload.data.order_code,
        narrative: payload.data.reference_note || `Payment for order ${payload.data.order_code}`,
        matched_order_code: payload.data.order_code,
        raw: {
          source: "admin-vietqr-ui",
        },
      },
    }

    try {
      await createBankTransaction(bankTxPayload)
    } catch (error) {
      console.error("BANK TX ERROR:", error)
    }
  }

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return

    const amountNumber = Number(amountReceived)
    if (!amountNumber || Number.isNaN(amountNumber)) {
      alert("Vui lòng nhập số tiền hợp lệ.")
      return
    }
    if (!transactionId.trim()) {
      alert("Vui lòng nhập mã giao dịch (transaction ID).")
      return
    }

    try {
      await onConfirmPayment({
        data: {
          order_code: selectedOrder.code,
          amount_vnd: amountNumber,
          transaction_id: transactionId.trim(),
          reference_note: referenceNote || undefined,
          paid_at: new Date().toISOString(),
          force: !isMatched,
          reason: !isMatched ? "Force confirm từ giao diện VietQR" : undefined,
        },
      })
      setShowDetailModal(false)
    } catch (error) {
      console.error("CONFIRM PAYMENT ERROR:", error)
      alert("Không thể xác nhận thanh toán. Vui lòng thử lại.")
    }
  }

  const isProcessing = confirmLoading || bankTxLoading

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {pendingLoading ? (
          <div className="p-4 text-sm text-gray-500">Loading pending VietQR orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Người ủng hộ</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Thời gian đặt</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order: any) => (
                  <tr key={order.code} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-gray-900">{order.code || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.full_name || "-"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {order.grand_total_vnd?.toLocaleString("vi-VN") || "0"}đ
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.payment_status || "PENDING")}`}
                      >
                        {order.payment_status || "PENDING"}
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
        )}
      </div>

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận thanh toán VietQR</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="rounded-lg border border-gray-200 p-4 text-sm grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-xs">Mã đơn</p>
                  <p className="font-mono font-bold text-gray-900">{selectedOrder.code || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Người ủng hộ</p>
                  <p className="font-medium text-gray-900">{selectedOrder.full_name || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Tổng tiền</p>
                  <p className="font-bold text-cyan-600">
                    {selectedOrder.grand_total_vnd?.toLocaleString("vi-VN") || "0"}đ
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Trạng thái</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(selectedOrder.payment_status || "PENDING")}`}
                  >
                    {selectedOrder.payment_status || "PENDING"}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-xs">Thời gian đặt</p>
                  <p className="text-gray-900">
                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString("vi-VN") : "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2">Số tiền nhận được</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2">Mã giao dịch (Transaction ID)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={isMatched}
                    onChange={(e) => setIsMatched(e.target.checked)}
                  />
                  Thông tin chuyển khoản khớp với yêu cầu
                </label>
                {!isMatched && (
                  <p className="text-xs text-amber-600">
                    Nếu xác nhận, đơn sẽ được ghi nhận thanh toán dù nội dung/ số tiền không khớp.
                  </p>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2">Ghi chú nội bộ / Reference note</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Khớp nội dung CK, mã giao dịch MB123..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    value={referenceNote}
                    onChange={(e) => setReferenceNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isProcessing ? "Đang xác nhận..." : "Xác nhận thanh toán"}
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
