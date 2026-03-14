import 'react-native-get-random-values';
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import { createAppKit, useAppKit } from '@reown/appkit-react-native';
import {
  useAccount,
  useWriteContract,
  useSendTransaction,
  useSwitchChain,
} from 'wagmi';
import { QueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import { sepolia } from 'wagmi/chains';
import {
  WALLETCONNECT_CONFIG,
  COLLATERAL_MANAGER_ADDRESS,
  TREASURY_ADDRESS,
  SEPOLIA_CHAIN_ID,
} from '@/config';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const { projectId, metadata } = WALLETCONNECT_CONFIG;

if (__DEV__ && !projectId) {
  console.warn(
    '[Web3] EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — WalletConnect will not work.'
  );
}

export const wagmiAdapter = new WagmiAdapter({
  networks: [sepolia],
  projectId,
});

createAppKit({
  projectId,
  metadata,
  adapters: [wagmiAdapter],
  networks: [sepolia] as any,
  defaultNetwork: sepolia as any,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
export const queryClient = new QueryClient();

// ─────────────────────────────────────────────────────────────────────────────
// ABI
// ─────────────────────────────────────────────────────────────────────────────

const COLLATERAL_DEPOSIT_ABI = [
  {
    inputs: [{ internalType: 'uint32', name: 'loanId', type: 'uint32' }],
    name: 'depositCollateral',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

export function useWalletConnection() {
  const { open } = useAppKit();
  const { isConnected, address } = useAccount();
  return { open, isConnected, address };
}

export function useDepositCollateral() {
  const { writeContractAsync, isPending } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  async function deposit(contractLoanId: number, collateralEth: string): Promise<`0x${string}`> {
    if (contractLoanId == null) {
      throw new Error('Loan not yet synced to blockchain. Please try again in a moment.');
    }
    await switchChainAsync({ chainId: SEPOLIA_CHAIN_ID });
    return writeContractAsync({
      address: COLLATERAL_MANAGER_ADDRESS as `0x${string}`,
      abi: COLLATERAL_DEPOSIT_ABI,
      functionName: 'depositCollateral',
      args: [contractLoanId],
      value: parseEther(collateralEth),
      chainId: SEPOLIA_CHAIN_ID,
    });
  }

  return { deposit, isPending };
}

export function useRepayLoan() {
  const { sendTransactionAsync, isPending } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();

  async function repay(amountEth: string): Promise<`0x${string}`> {
    await switchChainAsync({ chainId: SEPOLIA_CHAIN_ID });
    return sendTransactionAsync({
      to: TREASURY_ADDRESS as `0x${string}`,
      value: parseEther(amountEth),
      chainId: SEPOLIA_CHAIN_ID,
    });
  }

  return { repay, isPending };
}
