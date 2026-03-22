import { useEstimateGas, useFeeData } from 'wagmi';
import { encodeFunctionData, formatEther, parseEther } from 'viem';
import { COLLATERAL_MANAGER_ABI } from '@avelon_capstone/types';

interface GasEstimateResult {
    /** Gas limit with 20% buffer applied */
    gasLimit: bigint | undefined;
    /** Estimated gas cost in ETH (human-readable string) */
    estimatedCostEth: string | null;
    /** Total cost: amount + gas in ETH */
    totalCostEth: string | null;
    /** Whether the estimate is still loading */
    isLoading: boolean;
    /** Error from gas estimation (e.g. tx would revert) */
    error: Error | null;
}

/**
 * Pre-estimates gas for a collateral deposit transaction.
 * Shows the user the expected gas cost before they confirm in their wallet.
 */
export function useCollateralGasEstimate(params: {
    collateralManagerAddress: string;
    contractLoanId: number;
    amountEth: string;
    from?: string;
    enabled: boolean;
}): GasEstimateResult {
    const value = params.amountEth && params.enabled
        ? parseEther(params.amountEth)
        : undefined;

    const data = params.enabled
        ? encodeFunctionData({
              abi: COLLATERAL_MANAGER_ABI,
              functionName: 'depositCollateral',
              args: [params.contractLoanId],
          })
        : undefined;

    const {
        data: gasEstimate,
        isLoading: gasLoading,
        error: gasError,
    } = useEstimateGas({
        to: params.collateralManagerAddress as `0x${string}`,
        data,
        value,
        account: params.from as `0x${string}` | undefined,
        query: { enabled: params.enabled && !!value },
    });

    const { data: feeData, isLoading: feeLoading } = useFeeData({
        query: { enabled: params.enabled },
    });

    // Apply 20% buffer to gas limit to prevent out-of-gas failures
    const gasWithBuffer = gasEstimate
        ? (gasEstimate * 120n) / 100n
        : undefined;

    // Calculate estimated cost using maxFeePerGas (EIP-1559 worst case)
    const estimatedCostWei =
        gasWithBuffer && feeData?.maxFeePerGas
            ? gasWithBuffer * feeData.maxFeePerGas
            : undefined;

    const estimatedCostEth = estimatedCostWei
        ? formatEther(estimatedCostWei)
        : null;

    const totalCostEth =
        estimatedCostWei && value
            ? formatEther(value + estimatedCostWei)
            : null;

    return {
        gasLimit: gasWithBuffer,
        estimatedCostEth,
        totalCostEth,
        isLoading: gasLoading || feeLoading,
        error: gasError,
    };
}

/**
 * Pre-estimates gas for a plain ETH transfer (used for repayments).
 */
export function useTransferGasEstimate(params: {
    toAddress: string;
    amountEth: string;
    from?: string;
    enabled: boolean;
}): GasEstimateResult {
    const value = params.amountEth && params.enabled
        ? parseEther(params.amountEth)
        : undefined;

    const {
        data: gasEstimate,
        isLoading: gasLoading,
        error: gasError,
    } = useEstimateGas({
        to: params.toAddress as `0x${string}`,
        value,
        account: params.from as `0x${string}` | undefined,
        query: { enabled: params.enabled && !!value },
    });

    const { data: feeData, isLoading: feeLoading } = useFeeData({
        query: { enabled: params.enabled },
    });

    const gasWithBuffer = gasEstimate
        ? (gasEstimate * 120n) / 100n
        : undefined;

    const estimatedCostWei =
        gasWithBuffer && feeData?.maxFeePerGas
            ? gasWithBuffer * feeData.maxFeePerGas
            : undefined;

    const estimatedCostEth = estimatedCostWei
        ? formatEther(estimatedCostWei)
        : null;

    const totalCostEth =
        estimatedCostWei && value
            ? formatEther(value + estimatedCostWei)
            : null;

    return {
        gasLimit: gasWithBuffer,
        estimatedCostEth,
        totalCostEth,
        isLoading: gasLoading || feeLoading,
        error: gasError,
    };
}
