'use client';

import { useAuthControllerLogin } from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type { LoginDto } from '@/lib/api/generated/models';
import { saveAuth } from '@/src/lib/auth-storage';

export function useLogin() {
    const mutation = useAuthControllerLogin();

    return {
        ...mutation,
        mutateAsync: async (data: LoginDto) => {
            try {
                const result = await mutation.mutateAsync({ data });

                // The generated client returns the data directly.
                // We manually cast to expected shape since the type is missing in generated files.
                const responseData = result as unknown as { access_token: string; user: any };

                console.log('[Login Success]', responseData);

                if (responseData?.access_token && responseData?.user) {
                    saveAuth(responseData.access_token, responseData.user);
                }
                return responseData;
            } catch (error) {
                console.error('[Login Error]', error);
                throw error;
            }
        }
    };
}
