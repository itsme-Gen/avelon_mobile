/**
 * Secure Storage Utility
 * Uses expo-secure-store for encrypted token storage on native platforms
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'avelon_access_token';
const REFRESH_TOKEN_KEY = 'avelon_refresh_token';
const USER_KEY = 'avelon_user';

/**
 * Save authentication tokens securely
 */
export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    if (Platform.OS === 'web') {
        // Web fallback - not as secure but functional
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * Save user data
 */
export async function saveUser(user: object): Promise<void> {
    const userData = JSON.stringify(user);
    if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, userData);
    } else {
        await SecureStore.setItemAsync(USER_KEY, userData);
    }
}

/**
 * Get saved user data
 */
export async function getUser<T = object>(): Promise<T | null> {
    let userData: string | null;
    if (Platform.OS === 'web') {
        userData = localStorage.getItem(USER_KEY);
    } else {
        userData = await SecureStore.getItemAsync(USER_KEY);
    }

    if (!userData) return null;

    try {
        return JSON.parse(userData) as T;
    } catch {
        return null;
    }
}

/**
 * Clear all authentication data
 */
export async function clearAuthData(): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } else {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    }
}
