"use client"

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download } from "lucide-react"

export function AdminReports() {
  const revenueData = [
    { date: "1/12", revenue: 3.2, orders: 18 },
    { date: "2/12", revenue: 4.1, orders: 22 },
    { date: "3/12", revenue: 3.8, orders: 31 },
    { date: "4/12", revenue: 5.2, orders: 28 },
    { date: "5/12", revenue: 4.9, orders: 35 },
    { date: "6/12", revenue: 6.1, orders: 25 },
    { date: "7/12", revenue: 5.4, orders: 20 },
  ]

  const summaryStats = [
    { label: "Tổng đơn", value: "248", unit: "đơn" },
    { label: "Tổng tiền", value: "45.2", unit: "M đ" },
    { label: "Trung bình/ngày", value: "35.4", unit: "đơn" },
    { label: "Tỷ lệ thành công", value: "94.5", unit: "%" },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stat.value}
              <span className="text-lg text-gray-600 ml-1">{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: "#06b6d4", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Số đơn theo ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="orders" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Button */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2">
          <Download className="h-4 w-4" />
          Xuất báo cáo (PDF)
        </button>
      </div>
    </div>
  )
}
