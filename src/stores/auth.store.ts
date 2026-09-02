/**
 * Auth Store (Zustand)
 * Global state management for authentication
 */
import { create } from 'zustand';
import * as authService from '@/services/auth.service';
import { registerDeviceToken, unregisterDeviceToken } from '@/services/notification.service';
import { getUser, saveUser, clearAuthData } from '@/utils/storage';
import { useVerificationStore } from '@/stores/verification.store';
import type { User } from '@/services/auth.service';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User) => void;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, name?: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    setUser: (user: User) => {
        saveUser(user);
        set({ user });
    },

    /**
     * Login with email and password
     */
    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await authService.login(email, password);

            if (response.success && response.data) {
                // Save user data
                await saveUser(response.data.user);

                set({
                    user: response.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });

                // Register FCM device token for push notifications
                registerDeviceToken().catch(() => {});

                // Restore KYC/verification status
                useVerificationStore.getState().checkKycStatus().catch(() => {});

                return true;
            }

            set({ isLoading: false, error: 'Login failed' });
            return false;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            set({ isLoading: false, error: message });
            return false;
        }
    },

    /**
     * Register new user
     */
    register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await authService.register(email, password, name);

            set({ isLoading: false, error: null });

            return {
                success: response.success,
                message: response.message || 'Registration successful',
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            set({ isLoading: false, error: message });
            return { success: false, message };
        }
    },

    /**
     * Logout current user
     */
    logout: async () => {
        set({ isLoading: true });

        try {
            // Unregister FCM token before logging out
            await unregisterDeviceToken();
            await authService.logout();
        } catch {
            // Ignore logout errors - clear local state anyway
        } finally {
            await clearAuthData();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },

    /**
     * Check for existing session on app startup
     */
    checkSession: async () => {
        set({ isLoading: true });

        try {
            // First check local storage
            const savedUser = await getUser<User>();

            if (savedUser) {
                // Validate with server. A 401 may only mean the short-lived
                // access token expired, so refresh once before clearing state.
                let response;
                try {
                    response = await authService.getSession();
                } catch {
                    await authService.refreshAccessToken();
                    response = await authService.getSession();
                }

                if (response.data.isAuthenticated && response.data.user) {
                    set({
                        user: response.data.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return;
                }
            }

            // No valid session
            await clearAuthData();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch {
            // Session check failed - clear local state
            await clearAuthData();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    /**
     * Clear error message
     */
    clearError: () => set({ error: null }),
}));
