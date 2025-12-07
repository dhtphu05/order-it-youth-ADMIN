'use client';

import { LogOut } from "lucide-react";
import { useCurrentUser } from "@/src/lib/useCurrentUser";

export function TeamHeader() {
    const { user, logout } = useCurrentUser();

    if (!user) return null;

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 mb-6">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">IT</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Order IT Youth</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-600">{user.role}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
