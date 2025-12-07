'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    useAdminTeamDetail,
    useAddTeamMember,
    useRemoveTeamMember
} from '@/src/lib/hooks/useAdminTeams';
import { useAdminUsersList } from '@/src/lib/hooks/useAdminUsers';
import { AdminAddTeamMemberDto } from '@/lib/api/generated/models';

export default function AdminTeamDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const teamQuery = useAdminTeamDetail(id);
    const addMember = useAddTeamMember();
    const removeMember = useRemoveTeamMember();

    // Add Member Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);

    // User Search State
    const [userSearchQ, setUserSearchQ] = useState('');
    const usersQuery = useAdminUsersList({
        q: userSearchQ || undefined,
        limit: 10,
        page: 1, // simplified selection
    });

    const { register, handleSubmit, setValue, watch, reset } = useForm<AdminAddTeamMemberDto>();
    const selectedUserId = watch('userId');

    const onAddSubmit = async (data: AdminAddTeamMemberDto) => {
        try {
            await addMember.mutateAsync({ id, data });
            setIsAddOpen(false);
            reset();
        } catch (error) {
            console.error('Failed to add member', error);
        }
    };

    if (teamQuery.isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading team...</div>;
    }

    if (teamQuery.isError || !teamQuery.data) {
        return <div className="p-8 text-center text-red-500">Failed to load team.</div>;
    }

    const team = teamQuery.data;

    return (
        <div className="space-y-6 p-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
                        <div className="mt-1 flex gap-4 text-sm text-gray-500">
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{team.code}</span>
                            <span className={team.isActive ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                {team.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Members</h2>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                    >
                        Add Member
                    </button>
                </div>

                <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b font-medium text-gray-500">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role In Team</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {(!team.members || team.members.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                        No members in this team yet.
                                    </td>
                                </tr>
                            )}
                            {team.members?.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{member.fullName}</td>
                                    <td className="px-4 py-3 text-gray-600">{member.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 uppercase">
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            disabled={removeMember.isPending}
                                            onClick={() => removeMember.mutateAsync({ id, memberId: member.id })}
                                            className="text-red-600 hover:underline font-medium disabled:opacity-50"
                                        >
                                            {removeMember.isPending ? 'Removing...' : 'Remove'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-semibold">Add Team Member</h2>
                            <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-black">X</button>
                        </div>

                        <form onSubmit={handleSubmit(onAddSubmit)} className="p-6 space-y-4 flex-1 overflow-y-auto">
                            {/* User Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search User</label>
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={userSearchQ}
                                    onChange={(e) => setUserSearchQ(e.target.value)}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                                <div className="border rounded-md max-h-40 overflow-y-auto mt-2 divide-y">
                                    {usersQuery.isLoading && <div className="p-2 text-xs text-gray-500">Loading users...</div>}
                                    {usersQuery.data?.data?.map(u => (
                                        <div
                                            key={u.id}
                                            onClick={() => setValue('userId', u.id)}
                                            className={`p-2 text-sm cursor-pointer hover:bg-gray-50 flex justify-between items-center
                                                ${selectedUserId === u.id ? 'bg-blue-50 ring-1 ring-blue-500' : ''}
                                            `}
                                        >
                                            <div>
                                                <div className="font-medium">{u.full_name}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                            {selectedUserId === u.id && <span className="text-blue-600 text-xs font-bold">Selected</span>}
                                        </div>
                                    ))}
                                    {usersQuery.data?.data?.length === 0 && (
                                        <div className="p-2 text-xs text-center text-gray-500">No users found</div>
                                    )}
                                </div>
                                <input type="hidden" {...register('userId', { required: true })} />
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role in Team</label>
                                <select
                                    {...register('role', { required: true })}
                                    className="w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="STAFF">Staff</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="SHIPPER">Shipper</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addMember.isPending || !selectedUserId}
                                    className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-70"
                                >
                                    {addMember.isPending ? 'Adding...' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
