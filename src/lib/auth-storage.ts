const ACCESS_TOKEN_KEY = 'oiy_access_token';
const USER_KEY = 'oiy_user';

export interface AuthUser {
    id: string;
    full_name: string;
    email: string;
    role: string; // backend user_role enum as string
}

export function saveAuth(accessToken: string, user: AuthUser) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
        // ignore
    }
}

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
        return null;
    }
}

export function getAuthUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function clearAuth() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
    } catch {
        // ignore
    }
}

export function getRedirectPathForRole(role: string): string {
    switch (role) {
        case 'ADMIN':
            return '/admin';
        case 'STAFF':
            // Maps to /admin/teams or just /team? Prompt said /team.
            // Wait, previous tasks implemented /admin/teams.
            // Prompt says: "STAFF -> /team".
            // Prompt context says: "Admin Teams page (/admin/teams) is implemented".
            // But Requirements say: "STAFF -> /team".
            // I should follow the REQUIREMENT "Step 2: STAFF -> /team".
            // However, looking at the previous turn, the user might actually mean the existing pages?
            // "Goal: ... STAFF -> /team ... SHIPPER -> /shipper"
            // Since I haven't implemented /team or /shipper pages yet, I will strictly follow the prompt instructions for the redirect path strings.
            return '/team';
        case 'SHIPPER':
            return '/shipper';
        default:
            return '/admin/login'; // Fallback to login
    }
}
