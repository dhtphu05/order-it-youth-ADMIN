'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser, clearAuth, AuthUser } from '@/src/lib/auth-storage';

export function useCurrentUser() {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const stored = getAuthUser();
        setUser(stored ?? null);
        setIsReady(true);
    }, []);

    const logout = () => {
        clearAuth();
        setUser(null);
        router.push('/admin/login');
    };

    return { user, isReady, logout };
}
