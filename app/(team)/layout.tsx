'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function TeamLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={['STAFF', 'ADMIN']}>
            <div className="min-h-screen">
                {/* Team Shell could go here */}
                {children}
            </div>
        </RoleGuard>
    );
}
