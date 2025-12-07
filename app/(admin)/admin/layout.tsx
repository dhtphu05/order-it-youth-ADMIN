'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-gray-50/50">
                {/* Admin Shell could go here (Sidebar, etc) */}
                {children}
            </div>
        </RoleGuard>
    );
}
