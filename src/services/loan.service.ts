/**
 * Loan Service (API Client)
 * Handles loan plan retrieval, loan applications, and loan status.
 */
import { API_BASE_URL } from '@/config';
import { getAccessToken } from '@/utils/storage';

// ─── Types ──────────────────────────────────────────────────

export interface LoanPlan {
    id: string;
    name: string;
    description: string | null;
    minCreditScore: number;
    minAmount: number;
    maxAmount: number;
    durationOptions: number[];
    interestRate: number;
    interestType: 'FLAT' | 'COMPOUND';
    collateralRatio: number;
    originationFee: number;
    latePenaltyRate: number;
    gracePeriodDays: number;
    extensionAllowed: boolean;
    maxExtensionDays: number;
    extensionFee: number;
    isActive: boolean;
    eligible: boolean | null;
}

export interface Loan {
    id: string;
    userId: string;
    planId: string;
    walletId: string;
    contractLoanId: number | null;
    principal: string;
    collateralRequired: string;
    collateralDeposited: string;
    originationFee: string;
    principalOwed: string;
    interestOwed: string;
    feesOwed: string;
    duration: number;
    interestRate: number;
    creditScoreSnapshot: number;
    status: string;
    dueDate: string | null;
    repaidAt: string | null;
    createdAt: string;
    plan: { name: string };
    wallet: { address: string };
}

export interface LoanTransaction {
    id: string;
    loanId: string;
    type: 'COLLATERAL_DEPOSIT' | 'LOAN_DISBURSEMENT' | 'REPAYMENT' | 'COLLATERAL_TOPUP' | 'COLLATERAL_RETURN' | 'LIQUIDATION' | 'FEE_PAYMENT';
    amount: string;
    amountPHP: string | null;
    ethPrice: string | null;
    txHash: string | null;
    blockNumber: number | null;
    gasUsed: string | null;
    confirmed: boolean;
    confirmedAt: string | null;
    note: string | null;
    createdAt: string;
}

export interface LoanApplicationData {
    planId: string;
    amount: string;
    duration: number;
    walletId: string;
}

export interface Wallet {
    id: string;
    address: string;
    label: string;
    isPrimary: boolean;
}

// ─── Helpers ────────────────────────────────────────────────

async function authJsonHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

// ─── API Calls ──────────────────────────────────────────────

/**
 * Fetch blockchain contract addresses (CollateralManager, etc.)
 */
export async function getBlockchainStatus(): Promise<{ success: boolean; data?: { contracts: { collateralManager: string | null; avelonLending: string | null; repaymentSchedule: string | null } }; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/loans/blockchain/status`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch blockchain status' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Loan] Blockchain status error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Get all available loan plans
 */
export async function getLoanPlans(): Promise<{ success: boolean; data?: LoanPlan[]; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/plans`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch loan plans' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Loan] Get plans error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Apply for a loan
 */
export async function applyForLoan(data: LoanApplicationData): Promise<{ success: boolean; data?: Loan & { depositAddress?: string; instruction?: string }; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/loans`, {
            method: 'POST',
            headers: await authJsonHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to submit loan application' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Loan] Apply error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Get user's loans
 */
export async function getLoans(): Promise<{ success: boolean; data?: Loan[]; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/loans`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch loans' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Loan] Get loans error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Get a specific loan by ID
 */
export async function getLoanById(loanId: string): Promise<{ success: boolean; data?: Loan; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/loans/${encodeURIComponent(loanId)}`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch loan details' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Loan] Get loan error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Get user's connected wallets
 */
export async function getWallets(): Promise<{ success: boolean; data?: Wallet[]; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/wallets`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch wallets' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Loan] Get wallets error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Confirm collateral deposit — backend verifies txHash on Sepolia and activates loan
 */
export async function depositCollateral(
    loanId: string,
    txHash: string
): Promise<{ success: boolean; data?: { status: string; collateralDeposited: string }; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/loans/${encodeURIComponent(loanId)}/collateral`, {
            method: 'POST',
            headers: await authJsonHeaders(),
            body: JSON.stringify({ txHash }),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to record collateral deposit' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Loan] Deposit collateral error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Confirm loan repayment — backend verifies txHash on Sepolia and records repayment
 */
export async function repayLoan(
    loanId: string,
    amount: string,
    txHash: string
): Promise<{ success: boolean; data?: { remainingOwed: string; isFullyRepaid: boolean }; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/loans/${encodeURIComponent(loanId)}/repay`, {
            method: 'POST',
            headers: await authJsonHeaders(),
            body: JSON.stringify({ amount, txHash }),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to record repayment' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Loan] Repay loan error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Cancel a pending loan (only allowed in PENDING_COLLATERAL status)
 */
export async function cancelLoan(
    loanId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/loans/${encodeURIComponent(loanId)}`, {
            method: 'DELETE',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to cancel loan' };
        }

        return { success: true };
    } catch (error) {
        console.error('[Loan] Cancel loan error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Get transactions for a specific loan
 */
export async function getLoanTransactions(
    loanId: string
): Promise<{ success: boolean; data?: LoanTransaction[]; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/loans/${encodeURIComponent(loanId)}/transactions`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch transactions' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Loan] Get transactions error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}
