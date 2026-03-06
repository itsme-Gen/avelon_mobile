import { API_BASE_URL } from '@/config';
import { getAccessToken } from '@/utils/storage';

async function authHeaders(): Promise<HeadersInit> {
    const token = await getAccessToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export interface WalletInfo {
    id: string;
    address: string;
    chainId: number;
    isPrimary: boolean;
    isVerified: boolean;
    label: string | null;
    createdAt: string;
}

export interface WalletBalance {
    id: string;
    address: string;
    balance: string | null;
    isPrimary: boolean;
}

export async function getWallets(): Promise<{ success: boolean; data?: WalletInfo[]; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/wallets`, {
            method: "GET",
            headers: await authHeaders(),
        });
        const result = await response.json();
        if (!response.ok) {
            return { success: false, error: result.error?.message || "Failed to fetch wallets" };
        }
        return { success: true, data: result.data };
    } catch (error) {
        console.error("[Wallet] Get wallets error:", error);
        return { success: false, error: "Network error. Please try again." };
    }
}

export async function getBalances(): Promise<{ success: boolean; data?: WalletBalance[]; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/wallets/balances/all`, {
            method: "GET",
            headers: await authHeaders(),
        });
        const result = await response.json();
        if (!response.ok) {
            return { success: false, error: result.error?.message || "Failed to fetch balances" };
        }
        return { success: true, data: result.data };
    } catch (error) {
        console.error("[Wallet] Get balances error:", error);
        return { success: false, error: "Network error. Please try again." };
    }
}

export async function connectWallet(address: string): Promise<{ success: boolean; data?: { message: string; address: string }; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/wallets/connect`, {
            method: "POST",
            headers: await authHeaders(),
            body: JSON.stringify({ address: address.toLowerCase() }),
        });
        const result = await response.json();
        if (!response.ok) {
            return { success: false, error: result.error?.message || "Failed to connect wallet" };
        }
        return { success: true, data: result.data };
    } catch (error) {
        console.error("[Wallet] Connect error:", error);
        return { success: false, error: "Network error. Please try again." };
    }
}

export async function verifyWallet(address: string, signature: string, message: string): Promise<{ success: boolean; data?: WalletInfo; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/wallets/verify`, {
            method: "POST",
            headers: await authHeaders(),
            body: JSON.stringify({ address: address.toLowerCase(), signature, message }),
        });
        const result = await response.json();
        if (!response.ok) {
            return { success: false, error: result.error?.message || "Wallet verification failed" };
        }
        return { success: true, data: result.data };
    } catch (error) {
        console.error("[Wallet] Verify error:", error);
        return { success: false, error: "Network error. Please try again." };
    }
}

export async function removeWallet(walletId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/wallets/${encodeURIComponent(walletId)}`, {
            method: "DELETE",
            headers: await authHeaders(),
        });
        const result = await response.json();
        if (!response.ok) {
            return { success: false, error: result.error?.message || "Failed to remove wallet" };
        }
        return { success: true };
    } catch (error) {
        console.error("[Wallet] Remove error:", error);
        return { success: false, error: "Network error. Please try again." };
    }
}

export async function setPrimary(walletId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/wallets/${encodeURIComponent(walletId)}/primary`, {
            method: "PUT",
            headers: await authHeaders(),
        });
        const result = await response.json();
        if (!response.ok) {
            return { success: false, error: result.error?.message || "Failed to set primary wallet" };
        }
        return { success: true };
    } catch (error) {
        console.error("[Wallet] Set primary error:", error);
        return { success: false, error: "Network error. Please try again." };
    }
}
