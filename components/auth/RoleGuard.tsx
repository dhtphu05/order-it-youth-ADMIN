'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { getRedirectPathForRole } from '@/src/lib/auth-storage';

interface RoleGuardProps {
    allowedRoles: string[]; // e.g. ['ADMIN'], ['STAFF', 'ADMIN'], ['SHIPPER']
    children: ReactNode;
}

const LOGIN_PATH = '/admin/login';

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isReady } = useCurrentUser();

    useEffect(() => {
        if (!isReady) return;

        // Not logged in -> go to login
        if (!user) {
            if (pathname !== LOGIN_PATH) {
                router.replace(LOGIN_PATH);
            }
            return;
        }

        // Logged in but role is not allowed -> redirect by role or fallback
        if (!allowedRoles.includes(user.role)) {
            const redirectPath = getRedirectPathForRole(user.role) || LOGIN_PATH;
            // Avoid redirect loop if already at the redirect path
            if (pathname !== redirectPath) {
                router.replace(redirectPath);
            }
        }
    }, [isReady, user, allowedRoles, router, pathname]);

    if (!isReady) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
                Loading...
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        // While redirecting, render nothing
        return null;
    }

    return <>{children}</>;
}
