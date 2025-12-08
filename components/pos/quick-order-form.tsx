'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeams, useTeamMembers, useCreateQuickOrder } from '@/src/lib/hooks/usePos';
import type { Team, TeamMember, OrderItem, PosQuickOrderDto } from '@/src/lib/api/models/pos';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const quickOrderFormSchema = z.object({
  teamId: z.string().min(1, 'Vui lòng chọn đội'),
  shipperId: z.string().optional(),
  fullName: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  paymentMethod: z.enum(['CASH', 'TRANSFER']).default('CASH'),
  referrerCode: z.string().optional().default(''),
});

type QuickOrderFormValues = z.infer<typeof quickOrderFormSchema>;

interface QuickOrderFormProps {
  items: OrderItem[];
  onSuccess?: (orderId: string) => void;
}

export function QuickOrderForm({ items, onSuccess }: QuickOrderFormProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Fetch teams
  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useTeams();

  // Fetch team members
  const {
    data: teamMembers = [],
    isLoading: membersLoading,
    error: membersError,
  } = useTeamMembers(selectedTeam?.id);

  // Create order mutation
  const {
    mutate: createOrder,
    isPending: isCreating,
    isError: isCreateError,
    error: createError,
  } = useCreateQuickOrder();

  // Form setup
  const form = useForm<QuickOrderFormValues>({
    resolver: zodResolver(quickOrderFormSchema),
    defaultValues: {
      teamId: '',
      shipperId: '',
      fullName: '',
      phone: '',
      address: '',
      email: '',
      paymentMethod: 'CASH',
      referrerCode: '',
    },
  });

  const teamIdValue = form.watch('teamId');

  // Update selected team when teamId changes
  useEffect(() => {
    if (teamIdValue) {
      const team = teams.find((t) => t.id === teamIdValue);
      setSelectedTeam(team || null);
      // Reset shipper when team changes
      form.setValue('shipperId', '');
    }
  }, [teamIdValue, teams, form]);

  // Handle form submission
  const onSubmit = (values: QuickOrderFormValues) => {
    if (items.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng thêm sản phẩm vào đơn hàng',
        variant: 'destructive',
      });
      return;
    }

    const orderData: PosQuickOrderDto = {
      items,
      team_id: values.teamId || undefined,
      shipper_id: values.shipperId || undefined,
      full_name: values.fullName || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      email: values.email || undefined,
      payment_method: values.paymentMethod,
      referrer_code: values.referrerCode || undefined,
    };

    createOrder(orderData, {
      onSuccess: (response) => {
        toast({
          title: 'Thành công',
          description: 'Đơn hàng đã được tạo',
        });
        form.reset();
        onSuccess?.(response.id);
      },
      onError: (error) => {
        console.error('Error creating order:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tạo đơn hàng. Vui lòng thử lại.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tạo Đơn Hàng Nhanh</CardTitle>
        <CardDescription>Điền thông tin khách hàng và chọn đội để tạo đơn hàng</CardDescription>
      </CardHeader>
      <CardContent>
        {teamsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không thể tải danh sách đội. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
        )}

        {membersError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không thể tải danh sách thành viên. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
        )}

        {isCreateError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createError?.message || 'Có lỗi xảy ra khi tạo đơn hàng'}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Team Selection */}
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
                  <FormDescription>Vui lòng chọn đội bán hàng</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shipper Selection - Always visible */}
            <FormField
              control={form.control}
              name="shipperId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn Thành Viên Của Đội (Tùy chọn)</FormLabel>
                  <Select 
                    value={field.value || 'none'} 
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} 
                    disabled={!selectedTeam}
                  >
                    <FormControl>
                      <SelectTrigger disabled={!selectedTeam || membersLoading}>
                        <SelectValue placeholder={!selectedTeam ? 'Vui lòng chọn đội trước' : 'Chọn thành viên...'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Không chỉ định</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name} ({member.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {!selectedTeam 
                      ? 'Hãy chọn đội trước' 
                      : 'Gán đơn hàng cho thành viên của đội'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Info Section */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4">Thông Tin Khách Hàng (Tùy chọn)</h3>

              <div className="space-y-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và Tên</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mặc định: Khách vãng lai"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Để trống sẽ sử dụng giá trị mặc định
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số Điện Thoại</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mặc định: 0000000000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Để trống sẽ sử dụng giá trị mặc định
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="customer@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa Chỉ</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mặc định: Mua tại quầy"
                          {...field}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Để trống sẽ sử dụng giá trị mặc định
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Payment Info Section */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4">Thanh Toán</h3>

              <div className="space-y-4">
                {/* Payment Method */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phương Thức Thanh Toán</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Tiền Mặt</SelectItem>
                          <SelectItem value="TRANSFER">Chuyển Khoản</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Referrer Code */}
                {/* <FormField
                  control={form.control}
                  name="referrerCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Giới Thiệu (Tùy chọn)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập mã giới thiệu..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isCreating || teamsLoading}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo Đơn Hàng'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isCreating}
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
