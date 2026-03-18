/**
 * Application Configuration
 * 
 * NOTE: For physical device testing, use your machine's local IP instead of localhost
 * Find your IP by running: ipconfig (Windows) or ifconfig (Mac/Linux)
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API Configuration
// Use your machine's local IP for physical device testing
// Set EXPO_PUBLIC_API_URL in .env file (see .env.example)
const RAW_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function resolveApiBaseUrl(baseUrl: string): string {
    if (!__DEV__) {
        return baseUrl;
    }

    try {
        const parsedUrl = new URL(baseUrl);
        const isLoopbackHost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';

        if (!isLoopbackHost) {
            return baseUrl;
        }

        const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];

        if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
            parsedUrl.hostname = expoHost;
            return parsedUrl.toString().replace(/\/$/, '');
        }

        if (Platform.OS === 'android') {
            parsedUrl.hostname = '10.0.2.2';
            return parsedUrl.toString().replace(/\/$/, '');
        }

        return baseUrl;
    } catch {
        return baseUrl;
    }
}

export const API_BASE_URL = resolveApiBaseUrl(RAW_API_BASE_URL);

// App Information
export const APP_NAME = "Avelon";
export const APP_VERSION = "1.0.0";

// Environment
export const IS_DEV = __DEV__;
export const IS_PROD = !__DEV__;

// Firebase Configuration (for FCM push notifications)
export const FIREBASE_CONFIG = {
    apiKey: Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_FIREBASE_API_KEY_IOS
        : process.env.EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_FIREBASE_APP_ID_IOS
        : process.env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID,
};
