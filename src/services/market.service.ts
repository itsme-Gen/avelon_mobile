/**
 * Market Service (API Client)
 * Handles ETH price and price history retrieval.
 */
import { API_BASE_URL } from '@/config';
import { authenticatedFetch } from './authenticated-fetch';

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

// The advisory LSTM forecast. online is false when the AI service is down, and
// then none of the forecast fields are present.
export interface VolatilityForecast {
    online: boolean;
    horizonDays: number;
    advisoryOnly: boolean;
    model?: 'lstm' | 'ewma_fallback';
    priceSource?: 'coingecko' | 'snapshot';
    riskLevel?: string;
    predictedVolatility?: number;
    // Over the whole horizon, not annualised, as a fraction
    horizonVolatility?: number;
    currentPricePHP?: number;
}

function getNetworkErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);

    if (message.toLowerCase().includes('network request failed')) {
        return `Unable to reach market API (${API_BASE_URL}). Check your internet connection and EXPO_PUBLIC_API_URL configuration.`;
    }

    return 'Network error. Please try again.';
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
        return { success: false, error: getNetworkErrorMessage(error) };
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
        return { success: false, error: getNetworkErrorMessage(error) };
    }
}

/**
 * Get the advisory ETH volatility forecast. Signed-in only, so it goes through
 * authenticatedFetch; a failure just leaves the card without a forecast.
 */
export async function getVolatility(
    horizonDays = 7,
): Promise<{ success: boolean; data?: VolatilityForecast; error?: string }> {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/market/volatility?horizon=${horizonDays}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error?.message || 'Failed to fetch the forecast' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Market] Volatility error:', error);
        return { success: false, error: getNetworkErrorMessage(error) };
    }
}
