import {
    useAccount,
    useChainId,
    useSwitchChain,
    useSendTransaction,
    useSignMessage,
} from 'wagmi';
import { encodeFunctionData, parseEther } from 'viem';
import { sepolia } from 'wagmi/chains';
import { COLLATERAL_MANAGER_ABI } from '@/constants/abis';

export function useWalletConnect() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChainAsync } = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();
    const { signMessageAsync } = useSignMessage();

    /** Ensure wallet is on Sepolia before any transaction */
    async function ensureSepolia(): Promise<void> {
        if (chainId !== sepolia.id) {
            await switchChainAsync({ chainId: sepolia.id });
        }
    }

    /**
     * Deposit collateral for a loan via the CollateralManager contract.
     * Encodes depositCollateral(uint32 loanId) and sends ETH as msg.value.
     */
    async function depositCollateral(params: {
        collateralManagerAddress: string;
        contractLoanId: number;
        amountEth: string;
    }): Promise<string> {
        await ensureSepolia();

        const data = encodeFunctionData({
            abi: COLLATERAL_MANAGER_ABI,
            functionName: 'depositCollateral',
            args: [params.contractLoanId],
        });

        const txHash = await sendTransactionAsync({
            to: params.collateralManagerAddress as `0x${string}`,
            data,
            value: parseEther(params.amountEth),
        });

        return txHash;
    }

    /**
     * Add more collateral to an active loan.
     */
    async function addCollateral(params: {
        collateralManagerAddress: string;
        contractLoanId: number;
        amountEth: string;
    }): Promise<string> {
        await ensureSepolia();

        const data = encodeFunctionData({
            abi: COLLATERAL_MANAGER_ABI,
            functionName: 'addCollateral',
            args: [params.contractLoanId],
        });

        const txHash = await sendTransactionAsync({
            to: params.collateralManagerAddress as `0x${string}`,
            data,
            value: parseEther(params.amountEth),
        });

        return txHash;
    }

    /**
     * Repay a loan via plain ETH transfer to the treasury/repayment address.
     * The backend records the repayment after verifying the tx on-chain.
     */
    async function repayLoan(params: {
        toAddress: string;
        amountEth: string;
    }): Promise<string> {
        await ensureSepolia();

        const txHash = await sendTransactionAsync({
            to: params.toAddress as `0x${string}`,
            value: parseEther(params.amountEth),
        });

        return txHash;
    }

    /**
     * Sign a message for wallet ownership verification.
     * Used during wallet connection to replace the insecure connect-direct flow.
     */
    async function signVerificationMessage(message: string): Promise<string> {
        return signMessageAsync({ message });
    }

    return {
        address,
        isConnected,
        chainId,
        ensureSepolia,
        depositCollateral,
        addCollateral,
        repayLoan,
        signVerificationMessage,
    };
}
