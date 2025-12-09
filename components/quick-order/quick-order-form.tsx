'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CheckoutOrderDto } from '@/lib/api/generated/models/checkoutOrderDto';
import type { CheckoutOrderDtoPaymentMethod } from '@/lib/api/generated/models/checkoutOrderDtoPaymentMethod';
import type { CartItem } from '@/components/quick-order/quick-order-cart';
import type { AdminTeamResponseDto } from '@/lib/api/generated/models/adminTeamResponseDto';
import type { TeamMember } from '@/src/lib/hooks/useTeamMembers';
import { useQuickOrderCheckout, useQuickOrderTeamMembers, useQuickOrderTeams } from '@/src/lib/hooks/useQuickOrder';

const quickOrderFormSchema = z.object({
    teamId: z.string().min(1, 'Vui lòng chọn đội'),
    shipperId: z.string().optional(),
    fullName: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    note: z.string().optional().or(z.literal('')),
    paymentMethod: z.enum(['CASH', 'TRANSFER'] as [CheckoutOrderDtoPaymentMethod, CheckoutOrderDtoPaymentMethod]).default('CASH'),
});

type QuickOrderFormValues = z.infer<typeof quickOrderFormSchema>;

interface QuickOrderFormProps {
    items: CartItem[];
    onSuccess?: (orderCode: string) => void;
}

const generateIdemKey = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `quick-${Date.now()}`;
};

export function QuickOrderForm({ items, onSuccess }: QuickOrderFormProps) {
    const [selectedTeam, setSelectedTeam] = useState<AdminTeamResponseDto | null>(null);
    const { teams, isLoading: teamsLoading, error: teamsErrorObj } = useQuickOrderTeams();
    const {
        members: teamMembers,
        isLoading: membersLoading,
        error: membersError,
    } = useQuickOrderTeamMembers(selectedTeam?.id);
    const {
        checkout,
        isPending: isSubmitting,
        checkoutError,
    } = useQuickOrderCheckout();

    const form = useForm<QuickOrderFormValues>({
        resolver: zodResolver(quickOrderFormSchema),
        defaultValues: {
            teamId: '',
            shipperId: '',
            fullName: '',
            phone: '',
            address: '',
            email: '',
            note: '',
            paymentMethod: 'CASH',
        },
    });

    const teamIdValue = form.watch('teamId');

    useEffect(() => {
        if (teamIdValue) {
            const team = teams.find((candidate) => candidate.id === teamIdValue);
            setSelectedTeam(team ?? null);
            form.setValue('shipperId', '');
        } else {
            setSelectedTeam(null);
            form.setValue('shipperId', '');
        }
    }, [teamIdValue, teams, form]);

    const shipperOptions: TeamMember[] = useMemo(() => {
        return teamMembers ?? [];
    }, [teamMembers]);

    const validateCartItems = () => {
        if (items.length === 0) {
            toast({
                title: 'Thiếu sản phẩm',
                description: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi tạo đơn.',
                variant: 'destructive',
            });
            return false;
        }
        const hasInvalidItem = items.some((item) => !item.variant_id && !item.combo_id);
        if (hasInvalidItem) {
            toast({
                title: 'Thiếu thông tin sản phẩm',
                description: 'Mỗi mục phải có Variant ID hoặc Combo ID hợp lệ.',
                variant: 'destructive',
            });
            return false;
        }
        return true;
    };

    const onSubmit = async (values: QuickOrderFormValues) => {
        if (!selectedTeam) {
            toast({
                title: 'Chưa chọn đội',
                description: 'Vui lòng chọn đội để tiếp tục.',
                variant: 'destructive',
            });
            return;
        }

        if (!validateCartItems()) {
            return;
        }

        const checkoutItems = items.map((item) => ({
            variant_id: item.variant_id,
            combo_id: item.combo_id,
            quantity: item.quantity,
            price_version: item.price_version > 0 ? item.price_version : Date.now(),
            client_price_vnd: item.clientPriceVnd,
        }));

        const payload: CheckoutOrderDto = {
            full_name: values.fullName || undefined,
            phone: values.phone || undefined,
            email: values.email || undefined,
            address: values.address || undefined,
            note: values.note || undefined,
            payment_method: values.paymentMethod as CheckoutOrderDtoPaymentMethod,
            team_ref_code: selectedTeam.code,
            idem_scope: 'quick_order',
            idem_key: generateIdemKey(),
            items: checkoutItems,
        };

        try {
            const order = await checkout({
                payload,
                shipperId: values.shipperId || undefined,
            });
            toast({
                title: 'Đã tạo đơn hàng',
                description: `Mã đơn ${order.code}`,
            });
            form.reset();
            setSelectedTeam(null);
            onSuccess?.(order.code);
        } catch (error) {
            console.error('Quick order checkout failed', error);
            toast({
                title: 'Không thể tạo đơn hàng',
                description: 'Vui lòng thử lại hoặc liên hệ quản trị viên.',
                variant: 'destructive',
            });
        }
    };

    const globalError = teamsErrorObj ?? membersError ?? checkoutError;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Tạo Đơn Hàng Nhanh</CardTitle>
                <CardDescription>Chọn sản phẩm, đội phụ trách và shipper nếu cần.</CardDescription>
            </CardHeader>
            <CardContent>
                {globalError ? (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Không thể tải dữ liệu bắt buộc. Vui lòng thử lại sau.
                        </AlertDescription>
                    </Alert>
                ) : null}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="teamId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Chọn Đội *</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger disabled={teamsLoading}>
                                                <SelectValue placeholder="Chọn đội..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teams.map((team) => (
                                                <SelectItem key={team.id} value={team.id}>
                                                    {team.name} ({team.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Đơn hàng sẽ gắn với team được chọn.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="shipperId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shipper của đội (tùy chọn)</FormLabel>
                                    <Select
                                        value={field.value || 'none'}
                                        onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                                        disabled={!selectedTeam}
                                    >
                                        <FormControl>
                                            <SelectTrigger disabled={!selectedTeam || membersLoading}>
                                                <SelectValue placeholder={!selectedTeam ? 'Chọn đội trước' : 'Chọn shipper'} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Không chỉ định</SelectItem>
                                            {shipperOptions.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.full_name} {member.phone ? `(${member.phone})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Gán shipper sau khi tạo đơn.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="border-t pt-6">
                            <h3 className="text-sm font-semibold mb-4">Thông tin khách hàng (tùy chọn)</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Họ và tên</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mặc định: Khách vãng lai" {...field} />
                                            </FormControl>
                                            <FormDescription>Để trống sẽ dùng giá trị mặc định.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số điện thoại</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mặc định: 0000000000" {...field} />
                                            </FormControl>
                                            <FormDescription>Để trống sẽ dùng giá trị mặc định.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="customer@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Địa chỉ</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Mặc định: Mua tại quầy" {...field} className="resize-none" />
                                            </FormControl>
                                            <FormDescription>Để trống sẽ dùng giá trị mặc định.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="note"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ghi chú cho đơn</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Nhập ghi chú nội bộ nếu có" {...field} className="resize-none" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-sm font-semibold mb-4">Thanh toán</h3>
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phương thức</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CASH">Tiền mặt</SelectItem>
                                                <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" className="flex-1" disabled={isSubmitting || teamsLoading}>
                                {isSubmitting ? (
                                    <>
                                        <Spinner className="mr-2 h-4 w-4" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    'Tạo đơn hàng'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmitting}
                                onClick={() => {
                                    form.reset();
                                    setSelectedTeam(null);
                                }}
                            >
                                Xóa
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
