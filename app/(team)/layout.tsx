'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';

import { TeamHeader } from '@/components/team/TeamHeader';

export default function TeamLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={['STAFF', 'ADMIN']}>
            <div className="min-h-screen bg-gray-50">
                <TeamHeader />
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>
            </div>
        </RoleGuard>
    );
}
