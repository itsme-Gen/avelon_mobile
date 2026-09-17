/**
 * User Service (API Client)
 * Handles user profile retrieval and updates.
 */
import { API_BASE_URL } from '@/config';
import { authenticatedFetch } from './authenticated-fetch';
import { getAccessToken } from '@/utils/storage';

// ─── Types ──────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
    status: string;
    kycLevel: number;
    creditScore: number | null;
    creditTier: string | null;
    legalName: string | null;
    address: string | null;
    employmentType: string | null;
    totalBorrowed: string | null;
    totalRepaid: string | null;
    activeLoansCount: number;
    completedLoansCount: number;
    createdAt: string;
    lastLoginAt: string | null;
    wallets: {
        id: string;
        address: string;
        isPrimary: boolean;
        isVerified: boolean;
        label: string | null;
    }[];
}

export interface UserStats {
    totalBorrowed: string | null;
    totalRepaid: string | null;
    activeLoansCount: number;
    completedLoansCount: number;
    defaultCount: number;
    creditScore: number | null;
    creditTier: string | null;
    totalOutstanding: string;
    activeLoans: number;
    totalLoans: number;
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
 * Get current user's full profile
 */
export async function getProfile(): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch profile' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[User] Get profile error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Update user profile
 */
export async function updateProfile(
    data: { name?: string; phone?: string; avatar?: string },
): Promise<{ success: boolean; data?: Partial<UserProfile>; error?: string }> {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/users/me`, {
            method: 'PUT',
            headers: await authJsonHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to update profile' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[User] Update profile error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Get user statistics
 */
export async function getStats(): Promise<{ success: boolean; data?: UserStats; error?: string }> {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/users/me/stats`, {
            method: 'GET',
            headers: await authJsonHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch stats' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[User] Get stats error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}
