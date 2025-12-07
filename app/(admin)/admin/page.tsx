'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AdminDashboard } from '@/components/admin/admin-dashboard';
import {
  clearAuth,
  getAccessToken,
  getAuthUser,
  type AuthUser,
} from '@/src/lib/auth-storage';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getAuthUser();

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    setUser(storedUser);
    setIsCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminDashboard
      user={{
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.full_name ?? user.email,
      }}
      onLogout={handleLogout}
    />
  );
}
