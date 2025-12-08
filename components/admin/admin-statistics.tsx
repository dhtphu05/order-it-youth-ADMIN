"use client"

import { useMemo, useState } from "react"
import { endOfDay, format, formatISO, startOfDay } from "date-fns"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { getRangeDates, useAdminStats } from "@/src/lib/hooks/useAdminStats"

type RangeOption = "7d" | "30d"

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: "7d", label: "7 ngày gần đây" },
  { value: "30d", label: "30 ngày gần đây" },
]

const COLORS = ["#06b6d4", "#f97316", "#22c55e", "#0ea5e9", "#c026d3", "#facc15", "#94a3b8"]

const formatCurrency = (value?: number) => {
  if (!value) return "0 đ"
  return `${value.toLocaleString("vi-VN")} đ`
}

export function AdminStatistics() {
  const [range, setRange] = useState<RangeOption>("7d")
  const [customFrom, setCustomFrom] = useState<string | null>(null)
  const [customTo, setCustomTo] = useState<string | null>(null)

  const quickRange = useMemo(() => getRangeDates(range), [range])

  const resolvedFrom = customFrom
    ? formatISO(startOfDay(new Date(customFrom)))
    : quickRange.from
  const resolvedTo = customTo ? formatISO(endOfDay(new Date(customTo))) : quickRange.to

  const statsQuery = useAdminStats({ from: resolvedFrom, to: resolvedTo })
  const overview = statsQuery.overview
  const revenueByDay = statsQuery.revenueByDay
  const teamBreakdown = statsQuery.teamBreakdown.slice(0, 6)
  const paymentBreakdown = statsQuery.paymentBreakdown

  const isLoading = statsQuery.isLoading || statsQuery.isFetching

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Thống kê</h2>
          <p className="text-sm text-gray-600">Theo dõi tình hình doanh thu và đơn hàng theo thời gian.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setRange(option.value)
                setCustomFrom(null)
                setCustomTo(null)
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
                range === option.value
                  ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Từ ngày</label>
          <input
            type="date"
            value={customFrom ?? format(new Date(quickRange.from), "yyyy-MM-dd")}
            onChange={(e) => {
              const value = e.target.value
              setCustomFrom(value || null)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Đến ngày</label>
          <input
            type="date"
            value={customTo ?? format(new Date(quickRange.to), "yyyy-MM-dd")}
            onChange={(e) => {
              const value = e.target.value
              setCustomTo(value || null)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
        </div>
        <button
          onClick={() => {
            setCustomFrom(null)
            setCustomTo(null)
          }}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition"
        >
          Đặt lại
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Tổng doanh thu" value={formatCurrency(overview.totalRevenue)} loading={isLoading} />
        <KpiCard title="Tổng số đơn" value={overview.totalOrders.toLocaleString("vi-VN")} loading={isLoading} />
        <KpiCard
          title="Giá trị trung bình"
          value={formatCurrency(Math.round(overview.averageOrderValue))}
          loading={isLoading}
        />
        <KpiCard
          title="Tỉ lệ đơn thành công"
          value={`${overview.successRate.toFixed(1)}%`}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Doanh thu theo ngày</h3>
              <p className="text-sm text-gray-500">Tổng doanh thu từng ngày.</p>
            </div>
          </div>
          {isLoading ? (
            <LoadingState />
          ) : revenueByDay.length === 0 ? (
            <EmptyState message="Không có dữ liệu trong khoảng thời gian này." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), "dd/MM")}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => format(new Date(label), "dd/MM/yyyy")}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#0ea5e9" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Đơn hàng theo team</h3>
              <p className="text-sm text-gray-500">Top team theo doanh thu.</p>
            </div>
          </div>
          {isLoading ? (
            <LoadingState />
          ) : teamBreakdown.length === 0 ? (
            <EmptyState message="Không có đơn hàng thuộc các team." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="team" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Số đơn theo ngày</h3>
              <p className="text-sm text-gray-500">Số lượng đơn hàng tạo mới.</p>
            </div>
          </div>
          {isLoading ? (
            <LoadingState />
          ) : revenueByDay.length === 0 ? (
            <EmptyState message="Không có dữ liệu trong khoảng thời gian này." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), "dd/MM")}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip labelFormatter={(label) => format(new Date(label), "dd/MM/yyyy")} />
                  <Bar dataKey="orders" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h3>
              <p className="text-sm text-gray-500">Tỉ trọng theo phương thức thanh toán.</p>
            </div>
          </div>
          {isLoading ? (
            <LoadingState />
          ) : paymentBreakdown.length === 0 ? (
            <EmptyState message="Không có dữ liệu thanh toán." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="revenue"
                    nameKey="method"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {paymentBreakdown.map((entry, idx) => (
                      <Cell key={`cell-${entry.method}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type KpiCardProps = {
  title: string
  value: string
  loading?: boolean
}

function KpiCard({ title, value, loading }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {loading ? (
        <div className="mt-3 h-8 w-24 bg-gray-100 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      )}
    </div>
  )
}

function LoadingState() {
  return <div className="h-72 flex items-center justify-center text-sm text-gray-500">Đang tải dữ liệu...</div>
}

function EmptyState({ message }: { message: string }) {
  return <div className="h-72 flex items-center justify-center text-sm text-gray-500">{message}</div>
}
