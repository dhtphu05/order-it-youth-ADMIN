"use client"

import { useMemo, useState, type ComponentType, type MouseEvent } from "react"
import {
  Award,
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import {
  type AdminDonation,
  type AdminDonationListParams,
  type DonationPaymentStatus,
  useAdminDonationsList,
  useConfirmDonation,
} from "@/src/lib/hooks/useAdminDonations"

type StatusFilter = "ALL" | DonationPaymentStatus

type FilterState = {
  mssv: string
  status: StatusFilter
  startDate: string
  endDate: string
}

const INITIAL_FILTERS: FilterState = {
  mssv: "",
  status: "ALL",
  startDate: "",
  endDate: "",
}

const STATUS_LABELS: Record<DonationPaymentStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  FAILED: "Thất bại",
}

const STATUS_BADGES: Record<DonationPaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FAILED: "bg-rose-100 text-rose-700 border-rose-200",
}

const PVCD_RULES = [
  { range: "< 20.000đ", points: 0 },
  { range: "20.000đ – 30.000đ", points: 5 },
  { range: "30.000đ – 50.000đ", points: 7 },
  { range: "50.000đ – 100.000đ", points: 8 },
  { range: ">= 100.000đ", points: 10 },
]

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

const formatCurrency = (value?: number | null) => currencyFormatter.format(Math.max(0, value ?? 0))

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—"
  }
  try {
    return new Date(value).toLocaleString("vi-VN", { hour12: false })
  } catch {
    return value
  }
}

const PAGE_SIZE = 20

export function AdminDonations() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [selectedDonation, setSelectedDonation] = useState<AdminDonation | null>(null)

  const queryParams = useMemo<AdminDonationListParams>(() => {
    const params: AdminDonationListParams = {
      page,
      limit: PAGE_SIZE,
    }

    if (appliedFilters.mssv.trim()) {
      params.mssv = appliedFilters.mssv.trim()
    }
    if (appliedFilters.status !== "ALL") {
      params.status = appliedFilters.status
    }
    if (appliedFilters.startDate) {
      params.startDate = appliedFilters.startDate
    }
    if (appliedFilters.endDate) {
      params.endDate = appliedFilters.endDate
    }

    return params
  }, [page, appliedFilters])

  const { data, isLoading, isFetching, refetch, error } = useAdminDonationsList(queryParams)
  const { confirmDonation, isPending: confirmLoading } = useConfirmDonation()

  const donations: AdminDonation[] = data?.data ?? []
  const meta = data?.meta

  const stats = useMemo(() => {
    const pending = donations.filter((item) => item.payment_status === "PENDING")
    const confirmed = donations.filter((item) => item.payment_status === "CONFIRMED")

    const sumAmount = (items: AdminDonation[]) => items.reduce((sum, item) => sum + (item.amount ?? 0), 0)
    const sumPoints = confirmed.reduce((sum, item) => sum + Math.max(0, item.pvcd_points ?? 0), 0)

    return {
      pendingCount: pending.length,
      pendingAmount: sumAmount(pending),
      confirmedCount: confirmed.length,
      confirmedAmount: sumAmount(confirmed),
      totalPoints: sumPoints,
    }
  }, [donations])

  const handleApplyFilters = () => {
    setAppliedFilters(filters)
    setPage(1)
  }

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setAppliedFilters(INITIAL_FILTERS)
    setPage(1)
  }

  const handleConfirmDonation = async () => {
    if (!selectedDonation) {
      return
    }

    try {
      await confirmDonation(selectedDonation.id)
      toast({
        title: "Đã xác nhận quyên góp",
        description: `Mã ${selectedDonation.donation_code} đã được xác nhận thành công.`,
      })
      setSelectedDonation(null)
    } catch (err) {
      console.error("CONFIRM DONATION ERROR", err)
      toast({
        title: "Không thể xác nhận",
        description: "Vui lòng thử lại hoặc kiểm tra kết nối.",
        variant: "destructive",
      })
    }
  }

  const totalPages = meta?.pages ?? 1
  const currentPage = meta?.page ?? page
  const totalItems = meta?.total ?? donations.length
  const pageLimit = meta?.limit ?? PAGE_SIZE
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageLimit + 1
  const rangeEnd = Math.min(currentPage * pageLimit, totalItems)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Quản lý quyên góp</p>
          <h1 className="text-2xl font-semibold text-gray-900">Xác nhận ủng hộ học sinh</h1>
          <p className="text-sm text-gray-500">Theo dõi các yêu cầu quyên góp và tính điểm PVCĐ tự động.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          {isFetching && (
            <span className="text-xs font-medium text-cyan-700">Đang cập nhật dữ liệu...</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Đã xác nhận"
          value={formatCurrency(stats.confirmedAmount)}
          subLabel={`${stats.confirmedCount} lượt quyên góp`}
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="Đang chờ"
          value={formatCurrency(stats.pendingAmount)}
          subLabel={`${stats.pendingCount} quyên góp cần duyệt`}
          icon={Clock3}
          accent="bg-amber-50 text-amber-600"
        />
        <SummaryCard
          label="PVCĐ tích lũy"
          value={`${stats.totalPoints} điểm`}
          subLabel="Tự động tính theo quy định"
          icon={Award}
          accent="bg-indigo-50 text-indigo-600"
        />
        <SummaryCard
          label="Tổng bản ghi trang hiện tại"
          value={formatCurrency(donations.reduce((sum, item) => sum + (item.amount ?? 0), 0))}
          subLabel={`${donations.length} bản ghi`}
          icon={BadgeDollarSign}
          accent="bg-cyan-50 text-cyan-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          <Search className="h-4 w-4 text-gray-400" />
          Bộ lọc tìm kiếm
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">MSSV</label>
            <Input
              placeholder="VD: HS123"
              value={filters.mssv}
              onChange={(event) => setFilters((prev) => ({ ...prev, mssv: event.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Trạng thái</label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value as StatusFilter }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                <SelectItem value="FAILED">Hủy / thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Từ ngày</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Đến ngày</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            className="flex items-center gap-2"
            onClick={handleApplyFilters}
            disabled={isLoading}
          >
            <ShieldCheck className="h-4 w-4" />
            Áp dụng bộ lọc
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResetFilters}
            disabled={isLoading}
          >
            Đặt lại
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-base font-semibold text-gray-900">Danh sách quyên góp</p>
            <p className="text-sm text-gray-500">
              Hiển thị {rangeStart}-{rangeEnd} trên tổng {totalItems} bản ghi
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CalendarDaysIcon />
            Bộ lọc đang áp dụng
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 text-sm text-red-600">Không thể tải dữ liệu quyên góp.</div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã ủng hộ</TableHead>
                <TableHead>Học sinh</TableHead>
                <TableHead>MSSV</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Điểm PVCĐ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-gray-500">
                    Đang tải dữ liệu quyên góp...
                  </TableCell>
                </TableRow>
              ) : donations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-gray-500">
                    Không có bản ghi quyên góp phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-mono text-sm font-semibold text-gray-900">
                      {donation.donation_code}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{donation.student_name}</div>
                      <div className="text-xs text-gray-500">
                        {donation.student_class ? `Lớp ${donation.student_class}` : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{donation.mssv}</TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {formatCurrency(donation.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {donation.payment_status === "CONFIRMED"
                        ? `${donation.pvcd_points ?? 0} điểm`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGES[donation.payment_status]}`}
                      >
                        {STATUS_LABELS[donation.payment_status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      <div>Tạo: {formatDateTime(donation.created_at)}</div>
                      {donation.confirmed_at && (
                        <div>XN: {formatDateTime(donation.confirmed_at)}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                        disabled={donation.payment_status !== "PENDING" || confirmLoading}
                        onClick={() => setSelectedDonation(donation)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Xác nhận
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 text-sm text-gray-600">
          <div>
            Trang {currentPage}/{totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Trang trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
          <ShieldCheck className="h-5 w-5 text-cyan-600" />
          Quy tắc tính điểm PVCĐ
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Hệ thống tự động quy đổi số tiền ủng hộ thành điểm PVCĐ theo quy định dưới đây.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {PVCD_RULES.map((rule) => (
            <div
              key={rule.range}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center shadow-inner"
            >
              <p className="text-xs text-gray-500">{rule.range}</p>
              <p className="text-lg font-semibold text-gray-900">{rule.points} điểm</p>
            </div>
          ))}
        </div>
      </div>

      {selectedDonation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(event: MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget && !confirmLoading) {
              setSelectedDonation(null)
            }
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-cyan-600">Xác nhận quyên góp</p>
                <p className="text-lg font-bold text-gray-900">{selectedDonation.donation_code}</p>
              </div>
              <button
                className="text-2xl text-gray-400 hover:text-gray-600"
                onClick={() => !confirmLoading && setSelectedDonation(null)}
                disabled={confirmLoading}
              >
                ×
              </button>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm text-gray-700">
              <DetailRow label="Học sinh" value={selectedDonation.student_name} />
              <DetailRow label="MSSV" value={selectedDonation.mssv} />
              <DetailRow
                label="Lớp"
                value={selectedDonation.student_class ? `Lớp ${selectedDonation.student_class}` : "—"}
              />
              <DetailRow label="Số tiền" value={formatCurrency(selectedDonation.amount)} highlight />
              <DetailRow
                label="Trạng thái"
                value={STATUS_LABELS[selectedDonation.payment_status]}
              />
              <DetailRow
                label="Điểm PVCĐ dự kiến"
                value={
                  selectedDonation.payment_status === "CONFIRMED"
                    ? `${selectedDonation.pvcd_points ?? 0} điểm`
                    : "Sẽ tính sau khi xác nhận"
                }
              />
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setSelectedDonation(null)}
                disabled={confirmLoading}
              >
                Huỷ
              </Button>
              <Button
                className="bg-cyan-600 text-white hover:bg-cyan-500"
                onClick={handleConfirmDonation}
                disabled={confirmLoading}
              >
                {confirmLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Xác nhận ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type SummaryCardProps = {
  label: string
  value: string
  subLabel: string
  icon: ComponentType<{ className?: string }>
  accent: string
}

function SummaryCard({ label, value, subLabel, icon: Icon, accent }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subLabel}</p>
        </div>
        <div className={`rounded-full p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

type DetailRowProps = {
  label: string
  value: string
  highlight?: boolean
}

function DetailRow({ label, value, highlight }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? "font-semibold text-gray-900" : "text-gray-900"}>{value}</span>
    </div>
  )
}

function CalendarDaysIcon() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
      <Clock3 className="h-3.5 w-3.5 text-gray-400" />
      Bộ lọc theo thời gian
    </span>
  )
}
