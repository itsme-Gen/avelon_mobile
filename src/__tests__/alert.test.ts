import { Platform } from 'react-native';
import { Alert } from '@/utils/alert';

describe('cross-platform alert on web', () => {
  const originalOS = Platform.OS;
  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
  });
  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
  });

  beforeEach(() => {
    (globalThis as any).window = globalThis.window ?? {};
    window.alert = jest.fn();
    window.confirm = jest.fn();
  });

  it('shows a message and runs the only button', () => {
    const ok = jest.fn();
    Alert.alert('Registration Successful', 'Check your email.', [{ text: 'OK', onPress: ok }]);
    expect(window.alert).toHaveBeenCalledWith('Registration Successful\n\nCheck your email.');
    expect(ok).toHaveBeenCalled();
  });

  it('runs the action when a two-button prompt is confirmed', () => {
    (window.confirm as jest.Mock).mockReturnValue(true);
    const withdraw = jest.fn();
    const keep = jest.fn();
    Alert.alert('Withdraw application?', undefined, [
      { text: 'Keep it', style: 'cancel', onPress: keep },
      { text: 'Withdraw', style: 'destructive', onPress: withdraw },
    ]);
    expect(withdraw).toHaveBeenCalled();
    expect(keep).not.toHaveBeenCalled();
  });

  it('runs the cancel button when the prompt is dismissed', () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    const withdraw = jest.fn();
    const keep = jest.fn();
    Alert.alert('Withdraw application?', 'Sure?', [
      { text: 'Keep it', style: 'cancel', onPress: keep },
      { text: 'Withdraw', onPress: withdraw },
    ]);
    expect(keep).toHaveBeenCalled();
    expect(withdraw).not.toHaveBeenCalled();
  });
});
