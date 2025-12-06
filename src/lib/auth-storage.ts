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
