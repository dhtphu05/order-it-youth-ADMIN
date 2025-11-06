"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/login-page"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ShipperDashboard } from "@/components/shipper/shipper-dashboard"

export default function Home() {
  const [user, setUser] = useState<{
    id: string
    email: string
    role: "admin" | "shipper"
    name: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (email: string, password: string) => {
    const mockUsers = [
      {
        id: "admin-1",
        email: "admin@ity.com",
        password: "admin123",
        role: "admin" as const,
        name: "Admin Manager",
      },
      {
        id: "shipper-1",
        email: "shipper@ity.com",
        password: "shipper123",
        role: "shipper" as const,
        name: "Nguyễn Văn A",
      },
    ]

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return user.role === "admin" ? (
    <AdminDashboard user={user} onLogout={handleLogout} />
  ) : (
    <ShipperDashboard user={user} onLogout={handleLogout} />
  )
}
