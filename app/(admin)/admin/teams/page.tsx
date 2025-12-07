'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
    useAdminTeamsList,
    useCreateAdminTeam,
} from '@/src/lib/hooks/useAdminTeams';
import { AdminCreateTeamDto, AdminTeamsControllerListParams } from '@/lib/api/generated/models';

const PAGE_SIZE = 20;

export default function AdminTeamsPage() {
    const router = useRouter();
    // Local State
    const [page, setPage] = useState(1);
    const [q, setQ] = useState('');
    const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Query
    const listQuery = useAdminTeamsList({
        page,
        limit: PAGE_SIZE,
        q: q || undefined,
        isActive,
    });

    const createTeam = useCreateAdminTeam();

    // Create Form
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminCreateTeamDto>();

    const onSubmit = async (data: AdminCreateTeamDto) => {
        try {
            await createTeam.mutateAsync(data);
            setIsCreateOpen(false);
            reset();
        } catch (error) {
            console.error('Failed to create team', error);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
                    <p className="text-muted-foreground text-sm">Manage fulfillment teams.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    New Team
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <input
                    placeholder="Search name or code..."
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setPage(1);
                    }}
                    className="border rounded-md px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-black"
                />

                <select
                    value={isActive === undefined ? '' : String(isActive)}
                    onChange={(e) => {
                        const val = e.target.value;
                        setIsActive(val === '' ? undefined : val === 'true');
                        setPage(1);
                    }}
                    className="border rounded-md px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-black"
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                {listQuery.isError ? (
                    <div className="p-8 text-center text-red-500">Failed to load teams. Please try again.</div>
                ) : listQuery.isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading teams...</div>
                ) : (
                    <>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b font-medium text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Created At</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {listQuery.data?.data?.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No teams found.
                                        </td>
                                    </tr>
                                )}
                                {listQuery.data?.data?.map((team) => (
                                    <tr key={team.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{team.name}</td>
                                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{team.code}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                                                ${team.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                            `}>
                                                {team.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {// Check if created_at or createdAt based on DTO check. 
                                                // Generated DTO said 'createdAt'. Manual DTO for User said 'created_at'.
                                                // I will use 'createdAt' as per `adminTeamResponseDto.ts` content I saw.
                                                new Date(team.createdAt).toLocaleString()
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => router.push(`/admin/teams/${team.id}`)}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                            <div className="text-xs text-gray-500">
                                Page {page}
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
                                    // Pseudo check; relies on length < limit to disable
                                    disabled={listQuery.data?.data && listQuery.data.data.length < PAGE_SIZE}
                                    className="px-3 py-1 border rounded bg-white text-xs disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create Team Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-semibold">Create New Team</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-black">
                                X
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Team Name</label>
                                <input
                                    {...register('name', { required: true })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="e.g. Fulfillment A"
                                />
                                {errors.name && <p className="text-xs text-red-500">Name is required</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Team Code</label>
                                <input
                                    {...register('code', { required: true })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="e.g. TEAM-A"
                                />
                                {errors.code && <p className="text-xs text-red-500">Code is required</p>}
                            </div>

                            {/* Assuming isActive is optional/default true. Or add checkbox. */}
                            {/* The DTO likely has it optional? Let's assume default is fine, or simple checkbox */}

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
                                    disabled={createTeam.isPending}
                                    className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-70"
                                >
                                    {createTeam.isPending ? 'Creating...' : 'Create Team'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
