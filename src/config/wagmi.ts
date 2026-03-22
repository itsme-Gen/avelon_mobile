import '@walletconnect/react-native-compat';
import { createAppKit } from '@reown/appkit-wagmi-react-native';
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID!;

if (!projectId) {
    throw new Error('EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID is required');
}

const metadata = {
    name: 'Avelon',
    description: 'Decentralized Lending Platform',
    url: 'https://avelon.app',
    icons: ['https://avelon.app/icon.png'],
};

// CRITICAL: Only Sepolia chain configured — prevents mainnet connections.
// If user's wallet is on mainnet, wagmi will auto-prompt chain switch.
export const wagmiConfig = createConfig({
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(),
    },
});

export const appKit = createAppKit({
    projectId,
    wagmiConfig,
    defaultChain: sepolia,
    metadata,
});
