"use client"

import { useState } from "react"
import { Phone, MapPin, Truck } from "lucide-react"

interface Shipper {
  id: string
  name: string
  phone: string
  activeOrders: number
  totalDelivered: number
  region: string
  isActive: boolean
}

export function AdminShippers() {
  const [shippers] = useState<Shipper[]>([
    {
      id: "shipper_1",
      name: "Nguyễn Văn B",
      phone: "0905123456",
      activeOrders: 3,
      totalDelivered: 18,
      region: "Hải Châu",
      isActive: true,
    },
    {
      id: "shipper_2",
      name: "Trần Văn D",
      phone: "0912345678",
      activeOrders: 2,
      totalDelivered: 15,
      region: "Thanh Khê",
      isActive: true,
    },
    {
      id: "shipper_3",
      name: "Lê Minh E",
      phone: "0932456789",
      activeOrders: 0,
      totalDelivered: 12,
      region: "Sơn Trà",
      isActive: false,
    },
  ])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shippers.map((shipper) => (
          <div key={shipper.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{shipper.name}</h3>
                <div
                  className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    shipper.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${shipper.isActive ? "bg-green-600" : "bg-gray-600"}`}></span>
                  {shipper.isActive ? "Đang hoạt động" : "Offline"}
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <Truck className="h-6 w-6 text-cyan-600" />
              </div>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <a href={`tel:${shipper.phone}`} className="hover:text-cyan-600 hover:underline">
                  {shipper.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                {shipper.region}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600">Đang giao</p>
                <p className="text-2xl font-bold text-cyan-600">{shipper.activeOrders}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Đã giao</p>
                <p className="text-2xl font-bold text-green-600">{shipper.totalDelivered}</p>
              </div>
            </div>

            <button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 rounded-lg transition">
              Gán đơn hàng
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
