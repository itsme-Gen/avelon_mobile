/**
 * Auth Service (API Client)
 * 
 * This is NOT duplicating backend logic - it's an HTTP client that calls
 * the backend API endpoints. All business logic stays in avelon_backend.
 */
import { API_BASE_URL } from '@/config';
import { getAccessToken, getRefreshToken, saveTokens, clearAuthData } from '@/utils/storage';

// Types matching backend responses
export interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    status: string;
    kycLevel?: number;
    creditScore?: number;
    creditTier?: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data: {
        email: string;
        verificationToken?: string;
    };
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
    };
}

/**
 * Base API request helper
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get auth token if available
    const token = await getAccessToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `API Error: ${response.status}`);
    }

    return data;
}

/**
 * Register a new user
 * Calls: POST /api/v1/auth/register
 */
export async function register(
    email: string,
    password: string,
    name?: string
): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
}

/**
 * Login with email and password
 * Calls: POST /api/v1/auth/login
 */
export async function login(
    email: string,
    password: string
): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    // Save tokens securely
    if (response.success && response.data) {
        await saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
}

/**
 * Logout current user
 * Calls: POST /api/v1/auth/logout
 */
export async function logout(): Promise<void> {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
        // Always clear local auth data
        await clearAuthData();
    }
}

/**
 * Request password reset
 * Calls: POST /api/v1/auth/forgot-password
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

/**
 * Reset password with token
 * Calls: POST /api/v1/auth/reset-password
 */
export async function resetPassword(
    token: string,
    password: string
): Promise<{ success: boolean; message: string }> {
    return apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    });
}

/**
 * Get current session
 * Calls: GET /api/v1/auth/session
 */
export async function getSession(): Promise<{
    success: boolean;
    data: { user: User | null; isAuthenticated: boolean };
}> {
    return apiRequest('/auth/session', { method: 'GET' });
}

/**
 * Refresh access token
 * Calls: POST /api/v1/auth/refresh
 */
export async function refreshAccessToken(): Promise<{ success: boolean; data: { accessToken: string } }> {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await apiRequest<{ success: boolean; data: { accessToken: string } }>(
        '/auth/refresh',
        {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        }
    );

    // Update stored access token
    if (response.success && response.data.accessToken) {
        const existingRefresh = await getRefreshToken();
        if (existingRefresh) {
            await saveTokens(response.data.accessToken, existingRefresh);
        }
    }

    return response;
}
