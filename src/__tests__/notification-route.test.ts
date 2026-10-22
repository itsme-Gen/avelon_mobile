import { notificationRoute } from '@/utils/notification-route';

describe('tapping a push notification', () => {
  it('opens the loan list for anything about a loan', () => {
    expect(notificationRoute({ type: 'COLLATERAL_WARNING', loanId: 'cmvj65yye003jecu60sufg4xt' })).toBe('/(tabs)/Records');
  });

  it('opens the notification list for everything else', () => {
    expect(notificationRoute({ type: 'KYC_APPROVED' })).toBe('/notifications');
    expect(notificationRoute(undefined)).toBe('/notifications');
    expect(notificationRoute({ loanId: '' })).toBe('/notifications');
  });
});
