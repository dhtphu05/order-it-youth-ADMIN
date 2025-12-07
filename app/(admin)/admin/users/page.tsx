'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAdminUsersList, useCreateAdminUser, AdminUsersControllerListParams } from '@/src/lib/hooks/useAdminUsers';
import { AdminCreateUserDto } from '@/lib/api/generated/models';

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
    // Local State
    const [page, setPage] = useState(1);
    const [q, setQ] = useState('');
    const [role, setRole] = useState<AdminUsersControllerListParams['role'] | undefined>(undefined);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Queries
    const listQuery = useAdminUsersList({
        page,
        limit: PAGE_SIZE,
        q: q || undefined,
        role,
    });

    const createUser = useCreateAdminUser();

    // Create Form
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminCreateUserDto>();

    const onSubmit = async (data: AdminCreateUserDto) => {
        try {
            await createUser.mutateAsync(data);
            setIsCreateOpen(false);
            reset();
            // Optional: Show success toast
        } catch (error) {
            console.error('Failed to create user', error);
            // Optional: Show error toast
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground text-sm">Manage admin, staff, and shipper accounts.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    New User
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <input
                    placeholder="Search name, phone, email..."
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setPage(1);
                    }}
                    className="border rounded-md px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-black"
                />

                <select
                    value={role || ''}
                    onChange={(e) => {
                        setRole(e.target.value as any || undefined);
                        setPage(1);
                    }}
                    className="border rounded-md px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-black"
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="SHIPPER">Shipper</option>
                </select>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                {listQuery.isError ? (
                    <div className="p-8 text-center text-red-500">Failed to load users. Please try again.</div>
                ) : listQuery.isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : (
                    <>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b font-medium text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Full Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {listQuery.data?.data?.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                                {listQuery.data?.data?.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{user.full_name}</td>
                                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{user.phone || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                                                ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : ''}
                                                ${user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' : ''}
                                                ${user.role === 'SHIPPER' ? 'bg-green-100 text-green-800' : ''}
                                            `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {new Date(user.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                            <div className="text-xs text-gray-500">
                                Showing page {page} of {listQuery.data?.total_pages || 1}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="px-3 py-1 border rounded bg-white text-xs disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    // Pseudo check; relies on valid total_pages or empty data
                                    disabled={page >= (listQuery.data?.total_pages || 1)}
                                    className="px-3 py-1 border rounded bg-white text-xs disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create User Modal (Simple Overlay) */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-semibold">Create New User</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <input
                                    {...register('full_name', { required: true })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="John Doe"
                                />
                                {errors.full_name && <p className="text-xs text-red-500">Name is required</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    {...register('email', { required: true })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="john@example.com"
                                />
                                {errors.email && <p className="text-xs text-red-500">Email is required</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone (Optional)</label>
                                <input
                                    {...register('phone')}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="+84..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <input
                                    type="password"
                                    {...register('password', { required: true, minLength: 6 })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="******"
                                />
                                {errors.password && <p className="text-xs text-red-500">Password must be at least 6 chars</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <select
                                    {...register('role')}
                                    className="w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                    defaultValue="STAFF"
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="SHIPPER">Shipper</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createUser.isPending}
                                    className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-70"
                                >
                                    {createUser.isPending ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
