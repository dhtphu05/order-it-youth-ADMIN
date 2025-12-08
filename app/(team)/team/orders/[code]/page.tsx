'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useTeamOrderDetail, type TeamOrder } from '@/src/lib/hooks/useTeamOrders';
import { useTeamMembers } from '@/src/lib/hooks/useTeamMembers';
import { useAssignShipmentToMember } from '@/src/lib/hooks/useTeamShipments';

const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') {
        return '—';
    }
    return `${value.toLocaleString('vi-VN')} đ`;
};

const formatDateTime = (value?: string) => {
    if (!value) {
        return '—';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
};

const getErrorMessage = (error: unknown) => {
    if (!error) {
        return 'Đã có lỗi xảy ra.';
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return 'Đã có lỗi xảy ra.';
    }
};

const getFirstString = (...values: Array<string | null | undefined>) => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }
    return undefined;
};

const getTeamIdFromOrder = (order?: TeamOrder) => {
    if (!order) return undefined;
    const nestedTeam =
        (order as any).team ??
        (order as any).assigned_team ??
        (order as any).owner_team ??
        (order as any).ownerTeam;
    const nestedId = typeof nestedTeam === 'object' ? nestedTeam?.id : undefined;
    const fallbackId =
        (order as any).team_id ??
        (order as any).teamId ??
        (order as any).owner_team_id ??
        (order as any).ownerTeamId;
    const resolved = nestedId ?? fallbackId;
    return typeof resolved === 'string' ? resolved : resolved ? String(resolved) : undefined;
};

export default function TeamOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const code = params?.code as string;

    const orderQuery = useTeamOrderDetail(code);
    const assignShipment = useAssignShipmentToMember();

    const order = orderQuery.data;
    const teamId = getTeamIdFromOrder(order);
    const membersQuery = useTeamMembers(teamId);
    const shipperMembers = useMemo(
        () =>
            (membersQuery.members ?? []).filter((member) =>
                (member.role ?? '').toUpperCase().includes('SHIPPER'),
            ),
        [membersQuery.members],
    );
    const [selectedMemberId, setSelectedMemberId] = useState('');
    useEffect(() => {
        setSelectedMemberId('');
    }, [code]);

    if (orderQuery.isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading order...</div>;
    }

    if (orderQuery.isError || !orderQuery.data) {
        return <div className="p-8 text-center text-red-500">Failed to load order.</div>;
    }

    const assignedMemberId = getFirstString(
        (order as any).assigned_member_id,
        (order as any).assignedMemberId,
        order.shipment?.assigned_member_id,
        order.shipment?.assignedMemberId,
        (order as any).assigned_user_id,
        (order as any).assignedUserId,
        (order as any).shipper_id,
        (order as any).shipperId,
    );
    const currentAssigneeName = getFirstString(
        order.shipment?.assigned_name,
        (order as any).assigned_name,
        (order as any).assignedName,
        (order as any).shipperName,
        (order as any).shipper_name,
        (order as any).assigned_shipper_name,
        (order as any).assignedTeamName,
    );
    const currentAssigneePhone = getFirstString(
        order.shipment?.assigned_phone,
        (order as any).assigned_phone,
        (order as any).assignedPhone,
        (order as any).shipperPhone,
        (order as any).shipper_phone,
    );
    const matchedAssignee = shipperMembers.find(
        (member) =>
            member.id === assignedMemberId ||
            member.userId === assignedMemberId ||
            member.id === (order as any).assigned_user_id ||
            member.userId === (order as any).assigned_user_id,
    );

    const isAssigned = Boolean(currentAssigneeName || currentAssigneePhone);
    const handleAssignShipper = async () => {
        if (!order) return;
        if (!selectedMemberId) {
            toast({
                variant: 'destructive',
                title: 'Vui lòng chọn shipper',
                description: 'Bạn cần chọn một shipper trước khi gán đơn.',
            });
            return;
        }

        const selected = shipperMembers.find((member) => member.id === selectedMemberId);
        if (!selected) {
            toast({
                variant: 'destructive',
                title: 'Shipper không hợp lệ',
                description: 'Không tìm thấy thông tin shipper đã chọn.',
            });
            return;
        }

        try {
            await assignShipment.assign({
                code: order.code,
                memberId: selected.id,
                userId: selected.userId ?? selected.id,
            });
            toast({ title: 'Đã gán shipper cho đơn hàng thành công.' });
            setSelectedMemberId('');
            await orderQuery.refetch();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Không thể gán shipper',
                description: getErrorMessage(error),
            });
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        Order <span className="font-mono text-lg">{order.code}</span>
                    </h1>
                    <div className="text-sm text-gray-500">{formatDateTime(order.created_at)}</div>
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-4 flex flex-col gap-2 text-sm text-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-gray-500 uppercase text-xs tracking-wide">Referral Code</div>
                    <div className="font-mono text-sm text-gray-900">{order.referral_code ?? '—'}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-gray-500 uppercase text-xs tracking-wide">Team Note</div>
                    <div className="text-sm text-gray-900">{order.note ?? '—'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg border shadow-sm p-4">
                        <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div
                                    key={`${item.title}_${item.variant_id ?? ''}_${item.combo_id ?? ''}`}
                                    className="flex justify-between items-start py-2 border-b last:border-0"
                                >
                                    <div>
                                        <div className="font-medium text-gray-900">{item.title_snapshot ?? item.title}</div>
                                        <div className="text-sm text-gray-500">
                                            Qty: {item.quantity} × {formatCurrency(item.unit_price_vnd)}
                                        </div>
                                    </div>
                                    <div className="font-medium">{formatCurrency(item.line_total_vnd)}</div>
                                </div>
                            ))}
                            {order.items.length === 0 && (
                                <div className="py-6 text-center text-sm text-gray-500">No items found.</div>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(order.grand_total_vnd)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg border shadow-sm p-4 text-sm space-y-3">
                        <h2 className="font-semibold text-gray-900 text-base">Customer</h2>
                        <div>
                            <div className="text-gray-500">Name</div>
                            <div className="font-medium">{order.full_name}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Phone</div>
                            <div className="font-medium">{order.phone}</div>
                        </div>
                        {order.address && (
                            <div>
                                <div className="text-gray-500">Address</div>
                                <div className="font-medium">{order.address}</div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg border shadow-sm p-4 text-sm space-y-3">
                        <h2 className="font-semibold text-gray-900 text-base">Status</h2>
                        <div>
                            <div className="text-gray-500 mb-1">Payment Status</div>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                                ${order.payment_status === 'SUCCESS'
        ? 'bg-green-100 text-green-800'
        : order.payment_status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'}
                            `}
                            >
                                {order.payment_status}
                            </span>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Order Status</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 uppercase">
                                {order.order_status}
                            </span>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Fulfillment</div>
                            <span className="font-medium">{order.fulfillment_type}</span>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Payment Method</div>
                            <span className="font-medium">{order.payment_method}</span>
                        </div>
                        {order.delivery_attempts > 0 && (
                            <div>
                                <div className="text-gray-500">Delivery Attempts</div>
                                <div className="font-medium">{order.delivery_attempts}</div>
                            </div>
                        )}
                        {order.fulfilled_at && (
                            <div>
                                <div className="text-gray-500">Fulfilled At</div>
                                <div className="font-medium">{formatDateTime(order.fulfilled_at)}</div>
                            </div>
                        )}
                        {order.cancelled_at && (
                            <div className="text-red-600">
                                <div>Cancelled At</div>
                                <div>{formatDateTime(order.cancelled_at)}</div>
                                {order.cancelled_reason && <div>Reason: {order.cancelled_reason}</div>}
                            </div>
                        )}
                    </div>

                    {order.shipment && (
                        <div className="bg-white rounded-lg border shadow-sm p-4 text-sm space-y-2">
                            <h2 className="font-semibold text-gray-900 text-base">Shipment</h2>
                            <div>
                                <div className="text-gray-500">Status</div>
                                <div className="font-medium">{order.shipment.status ?? '—'}</div>
                            </div>
                            {currentAssigneeName && (
                                <div>
                                    <div className="text-gray-500">Assigned</div>
                                    <div className="font-medium">
                                        {currentAssigneeName}
                                        {currentAssigneePhone ? ` (${currentAssigneePhone})` : ''}
                                    </div>
                                </div>
                            )}
                            {order.shipment.pickup_eta && (
                                <div>
                                    <div className="text-gray-500">Pickup ETA</div>
                                    <div className="font-medium">{formatDateTime(order.shipment.pickup_eta)}</div>
                                </div>
                            )}
                            {order.shipment.delivered_at && (
                                <div>
                                    <div className="text-gray-500">Delivered At</div>
                                    <div className="font-medium">{formatDateTime(order.shipment.delivered_at)}</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-lg border shadow-sm p-4 text-sm space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-base font-semibold text-gray-900">Shipper hiện tại</h2>
                            {isAssigned && <span className="text-xs text-green-600 font-semibold uppercase">Đã gán</span>}
                        </div>
                        {isAssigned ? (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Họ tên</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {currentAssigneeName ?? matchedAssignee?.fullName ?? 'Không rõ'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Liên hệ</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {currentAssigneePhone ??
                                            matchedAssignee?.phone ??
                                            matchedAssignee?.email ??
                                            'Không có'}
                                    </p>
                                </div>
                                {matchedAssignee?.email && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{matchedAssignee.email}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Đơn hàng này chưa được gán shipper. Vui lòng gán ở phần bên dưới để đảm bảo đơn được xử
                                lý kịp thời.
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg border shadow-sm p-4 text-sm space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="font-semibold text-gray-900 text-base">Gán shipper</h2>
                            {membersQuery.isFetching && (
                                <span className="text-xs text-gray-500">Đang tải danh sách...</span>
                            )}
                        </div>

                        {order.shipment?.assigned_name && (
                            <div className="text-sm text-gray-600">
                                Đơn hiện đang được gán cho{' '}
                                <span className="font-medium text-gray-900">{order.shipment.assigned_name}</span>
                                {order.shipment.assigned_phone ? ` (${order.shipment.assigned_phone})` : ''}.
                                Bạn có thể gán lại cho shipper khác nếu cần.
                            </div>
                        )}

                        {!teamId ? (
                            <p className="text-sm text-gray-500">
                                Không tìm thấy thông tin team của đơn hàng nên không thể gán shipper.
                            </p>
                        ) : membersQuery.isError ? (
                            <p className="text-sm text-red-600">
                                Không thể tải danh sách shipper: {getErrorMessage(membersQuery.error)}
                            </p>
                        ) : shipperMembers.length === 0 && !membersQuery.isLoading ? (
                            <p className="text-sm text-gray-500">
                                Team chưa có shipper nào hoặc tất cả shipper đều không khả dụng.
                            </p>
                        ) : (
                            <>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Chọn shipper
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    value={selectedMemberId}
                                    onChange={(event) => setSelectedMemberId(event.target.value)}
                                    disabled={membersQuery.isLoading || shipperMembers.length === 0}
                                >
                                    <option value="">Chọn shipper...</option>
                                    {shipperMembers.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.fullName ?? member.email ?? member.id}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAssignShipper}
                                    disabled={!selectedMemberId || assignShipment.isPending}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition"
                                >
                                    {assignShipment.isPending ? 'Đang gán...' : 'Gán đơn cho shipper'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
