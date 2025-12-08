'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());

  useEffect(() => {
    // Enable MSW for development
    if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') {
      // Still start MSW for POS endpoints
    }

    const startMockServiceWorker = async () => {
      const { worker } = await import('@/src/mocks/browser');
      await worker.start({ onUnhandledRequest: 'bypass' });
    };

    void startMockServiceWorker().catch((error) => {
      console.error('Failed to start MSW', error);
    });
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
