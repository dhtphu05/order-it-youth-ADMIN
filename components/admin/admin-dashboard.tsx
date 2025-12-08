"use client"

import { useState } from "react"
import { LogOut, Home, Package, Users, BarChart3, CreditCard, ShoppingBag } from "lucide-react"
import { AdminOverview } from "./admin-overview"
import { AdminOrders } from "./admin-orders"
import { AdminShippers } from "./admin-shippers"
import { AdminReports } from "./admin-reports"
import { AdminVietQRVerification } from "./admin-vietqr-verification"
import { AdminProducts } from "./admin-products"
import { AdminStatistics } from "./admin-statistics"

interface AdminDashboardProps {
  user: {
    id: string
    email: string
    role: string
    name: string
  }
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "statistics" | "orders" | "vietqr" | "products" | "shippers" | "reports">("overview")

  const tabs = [
    // { id: "overview", label: "Tổng quan", icon: Home },
    { id: "statistics", label: "Thống kê", icon: BarChart3 },
    { id: "orders", label: "Đơn hàng", icon: Package },
    // { id: "vietqr", label: "Xác nhận VietQR", icon: CreditCard },
    { id: "products", label: "Sản phẩm", icon: ShoppingBag },
    { id: "shippers", label: "Shipper", icon: Users },
    { id: "reports", label: "Báo cáo", icon: BarChart3 },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">IT</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Order IT Youth</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-600">Admin</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === id
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "statistics" && <AdminStatistics />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "vietqr" && <AdminVietQRVerification />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "shippers" && <AdminShippers />}
        {activeTab === "reports" && <AdminReports />}
      </div>
    </div>
  )
}
