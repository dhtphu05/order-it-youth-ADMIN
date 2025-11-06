"use client"

import { Truck, Package, CheckCircle, Zap } from "lucide-react"

interface ShipperStatsProps {
  userName: string
}

export function ShipperStats({ userName }: ShipperStatsProps) {
  const stats = [
    {
      title: "Đơn đang giao",
      value: "3",
      change: "+2",
      icon: Truck,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Đã giao hôm nay",
      value: "5",
      change: "+3",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Tổng đơn tháng này",
      value: "42",
      change: "+12%",
      icon: Package,
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Tỷ lệ thành công",
      value: "98.5%",
      change: "+0.5%",
      icon: Zap,
      color: "bg-amber-100 text-amber-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Xin chào, {userName}!</h2>
        <p className="text-gray-600 mt-1">Đây là tóm tắt hoạt động của bạn hôm nay</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-green-600 font-medium mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
