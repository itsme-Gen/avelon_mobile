import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppKitProvider } from '@reown/appkit-react-native';
import { wagmiConfig, appKit } from '@/config/wagmi';
import type { ReactNode } from 'react';

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: ReactNode }) {
    return (
        <AppKitProvider instance={appKit}>
            <WagmiProvider config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </WagmiProvider>
        </AppKitProvider>
    );
}
