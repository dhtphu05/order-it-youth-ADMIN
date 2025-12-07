'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ShipperLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={['SHIPPER']}>
            <div className="min-h-screen">
                {/* Shipper Shell - minimal full screen */}
                {children}
            </div>
        </RoleGuard>
    );
}
