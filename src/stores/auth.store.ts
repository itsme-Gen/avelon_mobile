/**
 * Auth Store (Zustand)
 * Global state management for authentication
 */
import { create } from 'zustand';
import * as authService from '@/services/auth.service';
import { registerDeviceToken, unregisterDeviceToken } from '@/services/notification.service';
import { getUser, saveUser, clearAuthData, getRefreshToken } from '@/utils/storage';
import { endWalletSession } from '@/utils/wallet-session';
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
            await endWalletSession();
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

        const savedUser = await getUser<User>().catch(() => null);
        if (!savedUser) {
            await clearAuthData();
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        const signOut = async () => {
            await clearAuthData();
            set({ user: null, isAuthenticated: false, isLoading: false });
        };
        const signIn = async (user: User) => {
            try { await saveUser(user); } catch { /* cached copy only */ }
            set({ user, isAuthenticated: true, isLoading: false });
        };
        // No answer from the server is not a rejection. Keep the saved user and
        // let the next request refresh the session.
        const stayOffline = () => set({ user: savedUser, isAuthenticated: true, isLoading: false });

        let session;
        try {
            session = await authService.getSession();
        } catch {
            return stayOffline();
        }
        if (session.data.isAuthenticated && session.data.user) {
            return signIn(session.data.user);
        }

        // The access token lasts 15 minutes and the refresh token 7 days, so an
        // expired access token is the usual reason for this answer.
        if (!(await getRefreshToken().catch(() => null))) {
            return signOut();
        }
        try {
            await authService.refreshAccessToken();
        } catch (error) {
            const offline = error instanceof TypeError || /network/i.test(String(error));
            return offline ? stayOffline() : signOut();
        }
        try {
            session = await authService.getSession();
        } catch {
            return stayOffline();
        }
        if (session.data.isAuthenticated && session.data.user) {
            return signIn(session.data.user);
        }
        return signOut();
    },

    /**
     * Clear error message
     */
    clearError: () => set({ error: null }),
}));
