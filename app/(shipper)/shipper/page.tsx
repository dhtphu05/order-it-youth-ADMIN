'use client';

import { ShipperDashboard } from '@/components/shipper/shipper-dashboard';
import { useCurrentUser } from '@/src/lib/useCurrentUser';

export default function ShipperPage() {
    const { user, logout, isReady } = useCurrentUser();

    if (!isReady) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null; // or redirect, handled by RoleGuard ideally
    }

    // Map AuthUser to ShipperDashboard user prop (needs 'name' which is missing in AuthUser, likely full_name)
    const dashboardUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.full_name, // Mapping full_name to name
        full_name: user.full_name // Mapping for the specific line crashing
    };

    return <ShipperDashboard user={dashboardUser} onLogout={logout} />;
}
