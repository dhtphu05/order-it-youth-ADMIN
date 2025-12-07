"use client"

import { useState } from "react"
import { LogOut, RefreshCw, Search } from "lucide-react"
import { ShipperOrdersList } from "./shipper-orders-list"
import { ShipperStats } from "./shipper-stats"

interface ShipperDashboardProps {
  user: {
    id: string
    email: string
    role: string
    name: string
  }
  onLogout: () => void
}

export function ShipperDashboard({ user, onLogout }: ShipperDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">IT</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Order IT Youth</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-600">Shipper</p>
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

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Component */}
          <ShipperStats userName={user.name} />

          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã đơn hoặc SĐT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-[180px]"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="assigned">Được gán</option>
                  <option value="out_for_delivery">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                </select>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition flex items-center justify-center gap-2 min-w-fit">
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Làm mới</span>
                </button>
              </div>
            </div>

            {/* Orders List */}
            <ShipperOrdersList searchQuery={searchQuery} statusFilter={statusFilter} />
          </div>
        </div>
      </div>
    </div>
  )
}
