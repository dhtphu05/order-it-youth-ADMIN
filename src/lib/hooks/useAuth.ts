'use client';

import { useAuthControllerLogin } from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type { LoginDto, LoginResponse } from '@/lib/api/generated/models';
import { saveAuth } from '@/lib/auth-storage';

export function useLogin() {
    const mutation = useAuthControllerLogin();

    return {
        ...mutation,
        mutateAsync: async (data: LoginDto) => {
            const result = await mutation.mutateAsync({ data });
            // The generated client implementation might return the data directly or the Axios response.
            // Based on typical Orval + Axios setup, it returns the data directly if configured to do so,
            // or we might need to access .data. 
            // However, looking at previous useAuth.ts, it handled (res as any).data.
            // Let's stick to the previous robust implementation but cleaner.

            // We'll trust the generated type return, but inspect the runtime object if needed.
            // Types say it returns LoginResponse.
            const responseData = result as unknown as LoginResponse;

            if (responseData?.access_token && responseData?.user) {
                saveAuth(responseData.access_token, responseData.user);
            }
            return responseData;
        }
    };
}
