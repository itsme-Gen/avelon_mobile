/**
 * Application Constants
 */

// Import API configuration from central config
import { API_BASE_URL as CONFIG_API_URL } from '../config';

// Re-export for backward compatibility
export const API_BASE_URL = CONFIG_API_URL;

// App Information
export const APP_NAME = "Avelon";
export const APP_VERSION = "1.0.0";

// Authentication
export const AUTH_TOKEN_KEY = "avelon_auth_token";
export const REFRESH_TOKEN_KEY = "avelon_refresh_token";

// Validation Constants
export const PASSWORD_MIN_LENGTH = 8;
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;

// Loan Constants
export const MIN_COLLATERAL_RATIO = 150; // 150%
export const LIQUIDATION_RATIO = 120; // 120%

// Currency
export const DEFAULT_CURRENCY = "PHP";
export const CRYPTO_CURRENCY = "ETH";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Animation Durations (ms)
export const ANIMATION_DURATION_FAST = 200;
export const ANIMATION_DURATION_NORMAL = 300;
export const ANIMATION_DURATION_SLOW = 500;

// Colors (matching your theme)
export const COLORS = {
    primary: "#000000",
    secondary: "#6B7280",
    background: "#FFFFFF",
    surface: "#ECECEC",
    error: "#EF4444",
    success: "#22C55E",
    warning: "#F59E0B",
} as const;
