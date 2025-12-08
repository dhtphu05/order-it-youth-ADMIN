"use client"

import { useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  BadgeDollarSign,
  Ban,
  CheckCircle2,
  Loader2,
  MoreVertical,
  RefreshCcw,
  Search,
  Truck,
  XCircle,
} from "lucide-react"

import { toast } from "@/components/ui/use-toast"
import type { AdminOrdersControllerListParams } from "@/lib/api/generated/models/adminOrdersControllerListParams"
import type { AdminOrdersControllerListPaymentStatus } from "@/lib/api/generated/models/adminOrdersControllerListPaymentStatus"
import { AdminOrdersControllerListPaymentStatus as PaymentStatusEnum } from "@/lib/api/generated/models/adminOrdersControllerListPaymentStatus"
import { AdminFailFulfilmentDtoReasonCode } from "@/lib/api/generated/models/adminFailFulfilmentDtoReasonCode"
import type { ErrorResponseDto } from "@/lib/api/generated/models/errorResponseDto"
import type { OrderResponseDto } from "@/lib/api/generated/models/orderResponseDto"
import type { OrderResponseDtoFulfillmentType } from "@/lib/api/generated/models/orderResponseDtoFulfillmentType"
import type { OrderResponseDtoOrderStatus } from "@/lib/api/generated/models/orderResponseDtoOrderStatus"
import type { OrderResponseDtoPaymentMethod } from "@/lib/api/generated/models/orderResponseDtoPaymentMethod"
import type { OrderResponseDtoPaymentStatus } from "@/lib/api/generated/models/orderResponseDtoPaymentStatus"
import {
  useAdminOrdersControllerCompleteFulfilment,
  useAdminOrdersControllerFailFulfilment,
  useAdminOrdersControllerGet,
  useAdminOrdersControllerList,
  useAdminOrdersControllerRetryFulfilment,
  useAdminOrdersControllerStartFulfilment,
} from "@/lib/api/generated/endpoints/orderITYouthAdminAPI"
import { useAdminConfirmPayment, useAdminDeleteOrder } from "@/src/lib/hooks/useAdminOrders"

const PAGE_SIZE = 10

const ORDER_STATUS_LABELS: Record<OrderResponseDtoOrderStatus, string> = {
  CREATED: "Đã tạo",
  PAID: "Đã thanh toán",
  FULFILLING: "Đang giao",
  DELIVERY_FAILED: "Giao thất bại",
  FULFILLED: "Hoàn tất",
  CANCELLED: "Đã huỷ",
}

const ORDER_STATUS_BADGES: Record<OrderResponseDtoOrderStatus, string> = {
  CREATED: "bg-gray-100 text-gray-800",
  PAID: "bg-blue-100 text-blue-800",
  FULFILLING: "bg-cyan-100 text-cyan-800",
  DELIVERY_FAILED: "bg-red-100 text-red-800",
  FULFILLED: "bg-green-100 text-green-800",
  CANCELLED: "bg-slate-200 text-slate-700",
}

const PAYMENT_STATUS_LABELS: Record<OrderResponseDtoPaymentStatus, string> = {
  PENDING: "Chờ thanh toán",
  SUCCESS: "Đã thanh toán",
  FAILED: "Thanh toán lỗi",
  REFUNDED: "Đã hoàn",
}

const PAYMENT_STATUS_BADGES: Record<OrderResponseDtoPaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  SUCCESS: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
  REFUNDED: "bg-purple-100 text-purple-700",
}

const FULFILLMENT_LABELS: Record<OrderResponseDtoFulfillmentType, string> = {
  DELIVERY: "Giao tận nơi",
  PICKUP_SCHOOL: "Nhận tại trường",
}

const PAYMENT_METHOD_LABELS: Record<OrderResponseDtoPaymentMethod, string> = {
  VIETQR: "VietQR",
  CASH: "Tiền mặt",
  MANUAL_TRANSFER: "Chuyển khoản",
}

const PAYMENT_STATUS_OPTIONS: { value: "all" | AdminOrdersControllerListPaymentStatus; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: PaymentStatusEnum.PENDING, label: "Chờ thanh toán" },
  { value: PaymentStatusEnum.SUCCESS, label: "Đã thanh toán" },
  { value: PaymentStatusEnum.FAILED, label: "Thanh toán lỗi" },
  { value: PaymentStatusEnum.REFUNDED, label: "Đã hoàn" },
]

const DELETABLE_STATUSES: OrderResponseDtoOrderStatus[] = ["CREATED", "PAID", "FULFILLING", "DELIVERY_FAILED"]

type OrderListItem = OrderResponseDto & {
  email?: string
  address?: string
  note?: string
  team_note?: string
  referral_code?: string
  team_name?: string
  owner_team_name?: string
  assigned_team_name?: string
  team?: {
    name?: string
    display_name?: string
    code?: string
  }
  owner_team?: {
    name?: string
    display_name?: string
    code?: string
  }
  created_at?: string
  createdAt?: string
  shipperName?: string
  shipper_name?: string
}

type OrderItem = OrderResponseDto["items"][number]

const readStringField = (source: Record<string, unknown> | undefined, field: string) => {
  if (!source) return undefined
  const value = (source as Record<string, unknown>)[field]
  return typeof value === "string" && value.trim().length > 0 ? value : undefined
}

const getReferralCode = (order?: Partial<OrderListItem>) => {
  if (!order) return undefined
  return (
    order.referral_code ??
    readStringField(order, "referralCode") ??
    readStringField(order, "team_referral_code") ??
    readStringField(order, "teamReferralCode")
  )
}

const getTeamNote = (order?: Partial<OrderListItem>) => {
  if (!order) return undefined
  return (
    order.note ??
    order.team_note ??
    readStringField(order, "teamNote") ??
    readStringField(order, "customer_note") ??
    readStringField(order, "customerNote")
  )
}

const getItemTitle = (item: OrderItem) => {
  const record = item as Record<string, unknown>
  return (
    (record.title_snapshot as string | undefined) ??
    (record.titleSnapshot as string | undefined) ??
    (record.product_title as string | undefined) ??
    (record.productTitle as string | undefined) ??
    item.title ??
    "—"
  )
}

const getTeamName = (order?: Partial<OrderListItem>) => {
  if (!order) return undefined
  const direct =
    readStringField(order, "team_name") ??
    readStringField(order, "teamName") ??
    readStringField(order, "assigned_team_name") ??
    readStringField(order, "owner_team_name") ??
    readStringField(order, "ownerTeamName")

  if (direct) {
    return direct
  }

  const nestedTeam = order.team ?? order.owner_team
  if (nestedTeam) {
    const nested =
      readStringField(nestedTeam, "display_name") ??
      readStringField(nestedTeam, "displayName") ??
      readStringField(nestedTeam, "name")
    if (nested) {
      return nested
    }
  }

  const referral = getReferralCode(order)
  if (referral) {
    const match = referral.match(/team[-_\s]?(\d+)/i)
    if (match) {
      return `Team ${match[1]}`
    }
    return referral
  }

  return undefined
}

const canDeleteOrder = (status?: OrderResponseDtoOrderStatus) => {
  if (!status) return false
  return DELETABLE_STATUSES.includes(status)
}

type PaginatedResponse<T> = {
  data: T[]
  total: number
  limit: number
  page: number
}

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") {
    return "—"
  }

  return `${value.toLocaleString("vi-VN")}đ`
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return "—"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("vi-VN")
}

const getErrorMessage = (error: unknown) => {
  if (!error) {
    return "Đã có lỗi xảy ra"
  }

  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  const dto = error as ErrorResponseDto
  if (dto?.message) {
    return dto.message
  }

  const axiosError = error as { response?: { data?: { message?: string } } }
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message
  }

  return "Đã có lỗi xảy ra"
}

export function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | AdminOrdersControllerListPaymentStatus>("all")
  const [page, setPage] = useState(1)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrderCode, setSelectedOrderCode] = useState<string | null>(null)
  const [selectedOrderSnapshot, setSelectedOrderSnapshot] = useState<OrderListItem | null>(null)

  const listParams = useMemo<AdminOrdersControllerListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      q: searchQuery || undefined,
      paymentStatus: statusFilter === "all" ? undefined : statusFilter,
    }),
    [page, searchQuery, statusFilter],
  )

  const {
    data: ordersData,
    isLoading,
    isError,
    isFetching,
    error: ordersError,
    refetch: refetchOrders,
  } = useAdminOrdersControllerList<PaginatedResponse<OrderListItem>>(listParams, {
    query: {
      placeholderData: (previousData) => previousData,
      select: (response) => response as unknown as PaginatedResponse<OrderListItem>,
    },
  })

  const orders = (ordersData?.data ?? []) as OrderListItem[]

  const totalPages = useMemo(() => {
    if (!ordersData) {
      return 1
    }

    const currentLimit = ordersData.limit || PAGE_SIZE
    return Math.max(1, Math.ceil(ordersData.total / currentLimit))
  }, [ordersData])

  useEffect(() => {
    if (ordersData && page > totalPages) {
      setPage(totalPages)
    }
  }, [ordersData, page, totalPages])

  const {
    data: orderDetailData,
    isLoading: isOrderDetailLoading,
    isFetching: isOrderDetailFetching,
    isError: isOrderDetailError,
    error: orderDetailError,
    refetch: refetchOrderDetail,
  } = useAdminOrdersControllerGet<OrderListItem>(selectedOrderCode ?? "", {
    query: {
      enabled: Boolean(selectedOrderCode),
      select: (response) => response as unknown as OrderListItem,
    },
  })

  const detail = orderDetailData ?? selectedOrderSnapshot
  const detailLoading = isOrderDetailLoading || isOrderDetailFetching
  const detailReferralCode = getReferralCode(detail ?? undefined)
  const detailTeamNote = getTeamNote(detail ?? undefined)
  const detailTeamName = getTeamName(detail ?? undefined)

  const confirmPaymentMutation = useAdminConfirmPayment()
  const startFulfilmentMutation = useAdminOrdersControllerStartFulfilment()
  const failFulfilmentMutation = useAdminOrdersControllerFailFulfilment()
  const retryFulfilmentMutation = useAdminOrdersControllerRetryFulfilment()
  const completeFulfilmentMutation = useAdminOrdersControllerCompleteFulfilment()
  const deleteOrderMutation = useAdminDeleteOrder()

  const invalidateOrders = () => {
    void refetchOrders()
    if (selectedOrderCode) {
      void refetchOrderDetail()
    }
  }

  const handleConfirmPayment = async (targetOrder?: OrderListItem) => {
    const order = targetOrder ?? detail
    if (!order) return

    const amountLabel = formatCurrency(order.grand_total_vnd)
    const confirmed = window.confirm(
      `Bạn chắc chắn đã nhận đủ ${amountLabel} cho đơn ${order.code}?`,
    )
    if (!confirmed) {
      return
    }

    try {
      await confirmPaymentMutation.confirmPayment({
        code: order.code,
        amountVnd: order.grand_total_vnd,
      })
      toast({ title: "Xác nhận thanh toán thành công." })
      invalidateOrders()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Không thể xác nhận thanh toán",
        description: getErrorMessage(error),
      })
    }
  }

  const handleStartFulfilment = async () => {
    if (!detail) return

    const notePrompt = window.prompt("Ghi chú khi chuyển sang giao hàng", "")
    if (notePrompt === null) return

    try {
      await startFulfilmentMutation.mutateAsync({
        code: detail.code,
        data: { note: notePrompt.trim() ? notePrompt : undefined },
      })
      toast({ title: "Đã bắt đầu giao hàng" })
      invalidateOrders()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Không thể chuyển sang giao hàng",
        description: getErrorMessage(error),
      })
    }
  }

  const handleFailFulfilment = async () => {
    if (!detail) return

    const notePrompt = window.prompt("Ghi chú khi không thể giao hàng", "")
    if (notePrompt === null) return

    const reasonPrompt = window.prompt(
      "Mã lý do (CUSTOMER_NO_SHOW, UNREACHABLE, WRONG_LOCATION, OTHER)",
      AdminFailFulfilmentDtoReasonCode.UNREACHABLE,
    )
    if (reasonPrompt === null) return

    const normalized = reasonPrompt.toUpperCase()
    const validReasons = Object.values(AdminFailFulfilmentDtoReasonCode) as string[]
    const reasonCode = validReasons.includes(normalized)
      ? (normalized as AdminFailFulfilmentDtoReasonCode)
      : AdminFailFulfilmentDtoReasonCode.OTHER

    try {
      await failFulfilmentMutation.mutateAsync({
        code: detail.code,
        data: {
          reason_code: reasonCode,
          note: notePrompt.trim() ? notePrompt : undefined,
        },
      })
      toast({ title: "Đã ghi nhận giao hàng thất bại" })
      invalidateOrders()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Không thể cập nhật trạng thái giao thất bại",
        description: getErrorMessage(error),
      })
    }
  }

  const handleRetryFulfilment = async () => {
    if (!detail) return

    const notePrompt = window.prompt("Ghi chú cho lần giao lại", "")
    if (notePrompt === null) return

    try {
      await retryFulfilmentMutation.mutateAsync({
        code: detail.code,
        data: { note: notePrompt.trim() ? notePrompt : undefined },
      })
      toast({ title: "Đã chuyển đơn về trạng thái giao lại" })
      invalidateOrders()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Không thể chuyển sang giao lại",
        description: getErrorMessage(error),
      })
    }
  }

  const handleCompleteFulfilment = async () => {
    if (!detail) return

    const notePrompt = window.prompt("Ghi chú khi hoàn tất giao hàng", "")
    if (notePrompt === null) return

    try {
      await completeFulfilmentMutation.mutateAsync({
        code: detail.code,
        data: {
          note: notePrompt.trim() ? notePrompt : undefined,
          fulfilled_at: new Date().toISOString(),
        },
      })
      toast({ title: "Đã đánh dấu hoàn tất giao hàng" })
      invalidateOrders()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Không thể hoàn tất giao hàng",
        description: getErrorMessage(error),
      })
    }
  }

  const confirmDelete = (code: string) => {
    return window.confirm(`Bạn có chắc chắn muốn xoá đơn ${code}? Hành động này không thể hoàn tác.`)
  }

  const handleDeleteOrder = async () => {
    if (!detail) return
    if (!confirmDelete(detail.code)) return

    try {
      await deleteOrderMutation.deleteOrder({ code: detail.code })
      toast({ title: "Đã xoá đơn hàng" })
      invalidateOrders()
      setShowDetailModal(false)
      setSelectedOrderCode(null)
      setSelectedOrderSnapshot(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Không thể xoá đơn hàng",
        description: getErrorMessage(error),
      })
    }
  }

  const handleDeleteOrderFromList = async (order: OrderListItem) => {
    if (!confirmDelete(order.code)) return

    try {
      await deleteOrderMutation.deleteOrder({ code: order.code })
      toast({ title: "Đã xoá đơn hàng" })
      invalidateOrders()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Không thể xoá đơn hàng",
        description: getErrorMessage(error),
      })
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleStatusChange = (value: "all" | AdminOrdersControllerListPaymentStatus) => {
    setStatusFilter(value)
    setPage(1)
  }

  const openDetailModal = (order: OrderListItem) => {
    setSelectedOrderSnapshot(order)
    setSelectedOrderCode(order.code)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedOrderCode(null)
    setSelectedOrderSnapshot(null)
  }

  const basePage = ordersData?.page ?? page
  const itemsPerPage = ordersData?.limit ?? PAGE_SIZE
  const showingFrom = orders.length ? (basePage - 1) * itemsPerPage + 1 : 0
  const showingTo = orders.length ? showingFrom + orders.length - 1 : 0
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as "all" | AdminOrdersControllerListPaymentStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {isFetching && !isLoading && (
          <p className="text-xs text-gray-500">Đang đồng bộ dữ liệu...</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Team</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Hình thức</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                      Đang tải danh sách đơn hàng...
                    </div>
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-sm text-red-600">
                    Không thể tải danh sách đơn hàng: {getErrorMessage(ordersError)}
                  </td>
                </tr>
              )}

              {!isLoading && !isError && orders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-sm text-gray-500">
                    Chưa có đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}

              {!isLoading && !isError &&
                orders.map((order) => {
                  const shipper = order.shipperName ?? order.shipper_name
                  const teamName = getTeamName(order)
                  const createdAt = order.created_at ?? order.createdAt ?? order.fulfilled_at ?? order.cancelled_at

                  return (
                    <tr key={order.code} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{order.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{teamName ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{order.phone}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(order.grand_total_vnd)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_BADGES[order.order_status]}`}>
                            {ORDER_STATUS_LABELS[order.order_status]}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_BADGES[order.payment_status]}`}>
                            {PAYMENT_STATUS_LABELS[order.payment_status]}
                          </span>
                          {order.payment_status === PaymentStatusEnum.PENDING && order.payment_method === "VIETQR" && (
                            <button
                              onClick={() => handleConfirmPayment(order)}
                              disabled={confirmPaymentMutation.isPending}
                              className="mt-1 px-3 py-1 text-xs font-medium rounded-md border border-cyan-500 text-cyan-600 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {confirmPaymentMutation.isPending ? "Đang xác nhận..." : "Xác nhận thanh toán"}
                            </button>
                          )}
                          {canDeleteOrder(order.order_status) && (
                            <button
                              onClick={() => handleDeleteOrderFromList(order)}
                              disabled={deleteOrderMutation.isPending}
                              className="mt-1 px-3 py-1 text-xs font-medium rounded-md border border-rose-500 text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deleteOrderMutation.isPending ? "Đang xoá..." : "Xoá đơn"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {shipper || FULFILLMENT_LABELS[order.fulfillment_type]}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(createdAt)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDetailModal(order)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          aria-label="Xem chi tiết đơn hàng"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {ordersData && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-3 text-sm text-gray-600">
            <p>
              Hiển thị {showingFrom || 0}-{showingTo || 0} trong {ordersData.total} đơn hàng
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || isFetching}
                className="px-3 py-1 rounded-md border text-sm font-medium disabled:opacity-50"
              >
                Trước
              </button>
              <span>
                Trang {ordersData.page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || isFetching}
                className="px-3 py-1 rounded-md border text-sm font-medium disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng</h3>
                {detail && <p className="text-sm text-gray-500">Mã đơn: {detail.code}</p>}
              </div>
              <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600" aria-label="Đóng">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-600" /> Đang tải chi tiết đơn hàng...
                </div>
              )}

              {isOrderDetailError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                  Không thể tải chi tiết đơn hàng: {getErrorMessage(orderDetailError)}
                </div>
              )}

              {detail && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-500">Khách hàng</p>
                      <p className="font-medium text-gray-900">{detail.full_name}</p>
                      <p className="text-gray-700">SĐT: {detail.phone}</p>
                      <p className="text-gray-700">Email: {detail.email ?? "—"}</p>
                      <p className="text-gray-700">Địa chỉ: {detail.address ?? "—"}</p>
                      <p className="text-gray-700">
                        Referral code: <span className="font-mono">{detailReferralCode ?? "—"}</span>
                      </p>
                      <p className="text-gray-700">
                        Thuộc team: <span className="font-medium">{detailTeamName ?? "—"}</span>
                      </p>
                      <p className="text-gray-700">
                        Ghi chú đội: <span className="font-medium">{detailTeamNote ?? "—"}</span>
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-500">Thông tin thanh toán</p>
                      <p className="font-medium text-gray-900">{formatCurrency(detail.grand_total_vnd)}</p>
                      <p className="text-gray-700">
                        Phương thức: {PAYMENT_METHOD_LABELS[detail.payment_method] ?? detail.payment_method}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_BADGES[detail.order_status]}`}>
                          {ORDER_STATUS_LABELS[detail.order_status]}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_BADGES[detail.payment_status]}`}
                        >
                          {PAYMENT_STATUS_LABELS[detail.payment_status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-500">Hình thức giao</p>
                      <p className="text-gray-900 font-medium">
                        {FULFILLMENT_LABELS[detail.fulfillment_type]}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500">Số lần giao</p>
                      <p className="text-gray-900 font-medium">{detail.delivery_attempts}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500">Thất bại gần nhất</p>
                      <p className="text-gray-900 font-medium">{detail.delivery_failed_reason ?? "—"}</p>
                      <p className="text-gray-500 text-xs">{formatDateTime(detail.delivery_failed_at)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Sản phẩm</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium">Tên sản phẩm</th>
                            <th className="px-4 py-2 text-left font-medium">Số lượng</th>
                            <th className="px-4 py-2 text-left font-medium">Đơn giá</th>
                            <th className="px-4 py-2 text-left font-medium">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {detail.items?.map((item) => {
                            const resolvedTitle = getItemTitle(item)
                            const key = item.variant_id ?? item.combo_id ?? resolvedTitle

                            return (
                              <tr key={`${key}`}>
                                <td className="px-4 py-2 text-gray-900">{resolvedTitle}</td>
                              <td className="px-4 py-2 text-gray-700">{item.quantity}</td>
                              <td className="px-4 py-2 text-gray-700">{formatCurrency(item.unit_price_vnd)}</td>
                              <td className="px-4 py-2 text-gray-900 font-medium">{formatCurrency(item.line_total_vnd)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <ActionButton
                      icon={BadgeDollarSign}
                      label="Xác nhận thanh toán"
                      onClick={handleConfirmPayment}
                      disabled={detail.payment_status !== PaymentStatusEnum.PENDING}
                      loading={confirmPaymentMutation.isPending}
                    />
                    <ActionButton
                      icon={Truck}
                      label="Bắt đầu giao"
                      onClick={handleStartFulfilment}
                      disabled={detail.order_status !== "PAID"}
                      loading={startFulfilmentMutation.isPending}
                    />
                    <ActionButton
                      icon={XCircle}
                      label="Giao thất bại"
                      onClick={handleFailFulfilment}
                      disabled={detail.order_status !== "FULFILLING"}
                      loading={failFulfilmentMutation.isPending}
                    />
                    <ActionButton
                      icon={RefreshCcw}
                      label="Giao lại"
                      onClick={handleRetryFulfilment}
                      disabled={detail.order_status !== "DELIVERY_FAILED"}
                      loading={retryFulfilmentMutation.isPending}
                    />
                    <ActionButton
                      icon={CheckCircle2}
                      label="Hoàn tất giao"
                      onClick={handleCompleteFulfilment}
                      disabled={detail.order_status !== "FULFILLING"}
                      loading={completeFulfilmentMutation.isPending}
                    />
                    <ActionButton
                      icon={Ban}
                      label="Xoá đơn"
                      onClick={handleDeleteOrder}
                      disabled={!canDeleteOrder(detail.order_status)}
                      loading={deleteOrderMutation.isPending}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type ActionButtonProps = {
  icon: LucideIcon
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

function ActionButton({ icon: Icon, label, onClick, disabled, loading }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin text-cyan-600" /> : <Icon className="h-4 w-4 text-cyan-600" />}
      {label}
    </button>
  )
}
