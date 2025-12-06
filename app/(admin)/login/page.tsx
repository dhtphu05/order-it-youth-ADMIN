'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { useLogin } from '@/src/lib/hooks/useAuth';

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
    const router = useRouter();
    const login = useLogin();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            await login.mutateAsync({
                email: values.email,
                password: values.password,
            });

            toast.success('Logged in successfully');
            router.push('/admin'); // Redirect to admin dashboard
        } catch (error) {
            console.error(error);
            toast.error('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Login</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access the order management system
                    </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
                                {...form.register('email')}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="you@example.com"
                            />
                            {form.formState.errors.email && (
                                <p className="mt-2 text-sm text-red-600">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">
                            Password
                        </label>
                        <div className="mt-2">
                            <input
                                type="password"
                                {...form.register('password')}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="••••••••"
                            />
                            {form.formState.errors.password && (
                                <p className="mt-2 text-sm text-red-600">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={login.isPending}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {login.isPending ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
