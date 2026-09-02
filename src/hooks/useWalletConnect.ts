import {
    useAccount,
    useChainId,
    useSwitchChain,
    useSendTransaction,
    useSignMessage,
} from 'wagmi';
import { encodeFunctionData, parseEther } from 'viem';
import { appChain } from '../config/chain';
import { COLLATERAL_MANAGER_ABI, LIQUIDITY_POOL_ABI } from '@/constants/abis';

export function useWalletConnect() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChainAsync } = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();
    const { signMessageAsync } = useSignMessage();

    /** Ensure wallet is on the app chain before any transaction */
    async function ensureNetwork(): Promise<void> {
        if (chainId !== appChain.id) {
            await switchChainAsync({ chainId: appChain.id });
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
        await ensureNetwork();

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
        await ensureNetwork();

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
     * Repay a loan by calling repay() on the liquidity pool.
     *
     * Not a plain transfer: the pool has to know which loan the money settles, or
     * the payment lands as an untracked donation and the debt stays open. The
     * backend rejects a bare transfer for the same reason.
     */
    async function repayLoan(params: {
        liquidityPoolAddress: string;
        contractLoanId: number;
        amountEth: string;
    }): Promise<string> {
        await ensureNetwork();

        const data = encodeFunctionData({
            abi: LIQUIDITY_POOL_ABI,
            functionName: 'repay',
            args: [params.contractLoanId],
        });

        const txHash = await sendTransactionAsync({
            to: params.liquidityPoolAddress as `0x${string}`,
            data,
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
        ensureNetwork,
        depositCollateral,
        addCollateral,
        repayLoan,
        signVerificationMessage,
    };
}
