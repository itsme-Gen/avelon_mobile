/**
 * Market Service (API Client)
 * Handles ETH price and price history retrieval.
 */
import { API_BASE_URL } from '@/config';

// ─── Types ──────────────────────────────────────────────────

export interface PriceData {
    ethPricePHP: number;
    source: string;
    change24h: number;
    changePercent24h: number;
    updatedAt: string;
}

export interface PriceHistoryPoint {
    id: string;
    ethPricePHP: number;
    source: string;
    createdAt: string;
}

// ─── API Calls ──────────────────────────────────────────────

/**
 * Get current ETH/PHP price
 */
export async function getPrice(): Promise<{ success: boolean; data?: PriceData; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/market/price`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch price' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Market] Price error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Get ETH/PHP price history
 * @param days Number of days to look back (1-365, default 7)
 */
export async function getPriceHistory(
    days = 7,
): Promise<{ success: boolean; data?: PriceHistoryPoint[]; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/market/price/history?days=${days}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch price history' };
        }

        return { success: true, data: result.data?.history };
    } catch (error) {
        console.error('[Market] Price history error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}
