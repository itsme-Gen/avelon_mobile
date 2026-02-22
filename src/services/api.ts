/**
 * API Client
 * Base configuration for API requests
 */

import { API_BASE_URL } from '../config';

/**
 * Base fetch wrapper with common configuration
 */
export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
}

/**
 * GET request helper
 */
export function get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request helper
 */
export function post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return apiClient<T>(endpoint, {
        ...options,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PUT request helper
 */
export function put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return apiClient<T>(endpoint, {
        ...options,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * DELETE request helper
 */
export function del<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "DELETE" });
}
