jest.mock('@/services/auth.service', () => ({
  getSession: jest.fn(),
  refreshAccessToken: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
}));
jest.mock('@/services/notification.service', () => ({
  registerDeviceToken: jest.fn().mockResolvedValue(undefined),
  unregisterDeviceToken: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/utils/storage', () => ({
  getUser: jest.fn(),
  saveUser: jest.fn(),
  clearAuthData: jest.fn(),
  getRefreshToken: jest.fn(),
}));
jest.mock('@/utils/wallet-session', () => ({ endWalletSession: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/stores/verification.store', () => ({
  useVerificationStore: { getState: () => ({ checkKycStatus: jest.fn().mockResolvedValue(undefined) }) },
}));

import * as authService from '@/services/auth.service';
import * as storage from '@/utils/storage';
import { endWalletSession } from '@/utils/wallet-session';
import { useAuthStore } from '@/stores/auth.store';

const user = { id: 'u1', email: 'b@test.com', name: null, role: 'BORROWER', status: 'CONNECTED' };
const signedOut = { success: true, data: { user: null, isAuthenticated: false } };
const signedIn = { success: true, data: { user, isAuthenticated: true } };

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  (storage.getUser as jest.Mock).mockResolvedValue(user);
  (storage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token');
});

describe('restoring a session at launch', () => {
  it('refreshes an expired access token instead of signing out', async () => {
    (authService.getSession as jest.Mock).mockResolvedValueOnce(signedOut).mockResolvedValueOnce(signedIn);
    (authService.refreshAccessToken as jest.Mock).mockResolvedValue({ success: true, data: { accessToken: 'new' } });

    await useAuthStore.getState().checkSession();

    expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(storage.clearAuthData).not.toHaveBeenCalled();
  });

  it('signs out when the refresh token is no longer valid', async () => {
    (authService.getSession as jest.Mock).mockResolvedValue(signedOut);
    (authService.refreshAccessToken as jest.Mock).mockRejectedValue(new Error('Invalid refresh token'));

    await useAuthStore.getState().checkSession();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(storage.clearAuthData).toHaveBeenCalled();
  });

  it('stays signed in while offline', async () => {
    (authService.getSession as jest.Mock).mockRejectedValue(new TypeError('Network request failed'));
    (authService.refreshAccessToken as jest.Mock).mockRejectedValue(new TypeError('Network request failed'));

    await useAuthStore.getState().checkSession();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual(user);
    expect(storage.clearAuthData).not.toHaveBeenCalled();
  });

  it('starts signed out with no saved user', async () => {
    (storage.getUser as jest.Mock).mockResolvedValue(null);
    await useAuthStore.getState().checkSession();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(authService.getSession).not.toHaveBeenCalled();
  });
});

describe('logging out', () => {
  it('ends the wallet session so the next user cannot inherit it', async () => {
    await useAuthStore.getState().logout();
    expect(endWalletSession).toHaveBeenCalled();
    expect(storage.clearAuthData).toHaveBeenCalled();
  });
});
