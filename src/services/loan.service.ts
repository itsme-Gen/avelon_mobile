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
    principal: string;
    collateralRequired: string;
    collateralDeposited: string;
    duration: number;
    interestRate: number;
    status: string;
    dueDate: string | null;
    createdAt: string;
    plan: { name: string };
    wallet: { address: string };
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
    isDefault: boolean;
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
