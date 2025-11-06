"use client"

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
import { Package, Truck, CheckCircle, DollarSign } from "lucide-react"

export function AdminOverview() {
  const stats = [
    {
      title: "Tổng đơn hàng",
      value: "248",
      change: "+12%",
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Đang giao",
      value: "23",
      change: "+5%",
      icon: Truck,
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Đã giao",
      value: "198",
      change: "+8%",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Tổng tiền gây quỹ",
      value: "45.2M",
      change: "+15%",
      icon: DollarSign,
      color: "bg-amber-100 text-amber-600",
    },
  ]

  const orderStatusData = [
    { name: "Chưa gán", value: 27, fill: "#9ca3af" },
    { name: "Đã gán", value: 98, fill: "#a7f3d0" },
    { name: "Đã giao", value: 198, fill: "#86efac" },
    { name: "Thất bại", value: 12, fill: "#fca5a5" },
  ]

  const dailyOrdersData = [
    { day: "T2", orders: 18 },
    { day: "T3", orders: 22 },
    { day: "T4", orders: 31 },
    { day: "T5", orders: 28 },
    { day: "T6", orders: 35 },
    { day: "T7", orders: 25 },
    { day: "CN", orders: 20 },
  ]

  const revenueData = [
    { day: "1/12", revenue: 3.2 },
    { day: "2/12", revenue: 4.1 },
    { day: "3/12", revenue: 3.8 },
    { day: "4/12", revenue: 5.2 },
    { day: "5/12", revenue: 4.9 },
    { day: "6/12", revenue: 6.1 },
    { day: "7/12", revenue: 5.4 },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-green-600 font-medium mt-2">{stat.change} vs tuần trước</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng theo ngày</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyOrdersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="orders" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
