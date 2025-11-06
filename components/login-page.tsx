"use client"

import type React from "react"

import { useState } from "react"
import { LogIn } from "lucide-react"

interface LoginPageProps {
  onLogin: (email: string, password: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      if (!email || !password) {
        setError("Vui lòng nhập email và mật khẩu")
        setIsLoading(false)
        return
      }

      onLogin(email, password)
      if (!email.includes("@ity.com")) {
        setError("Tài khoản hoặc mật khẩu không chính xác")
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">IT</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Order IT Youth</h1>
          </div>
          <p className="text-gray-600 text-sm">Hệ thống quản lý đơn hàng thiện nguyện</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Đăng nhập</h2>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ity.com hoặc shipper@ity.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          {/* Demo Credentials */}
          <div className="bg-cyan-50 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-semibold text-gray-900">Tài khoản Demo:</p>
            <div>
              <p className="text-gray-600">
                <span className="font-medium">Admin:</span> admin@ity.com / admin123
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-medium">Shipper:</span> shipper@ity.com / shipper123
              </p>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">© 2025 Order IT Youth. Khoa CNTT</p>
      </div>
    </div>
  )
}
