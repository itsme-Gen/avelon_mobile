import { needsVerification } from '@/utils/wallet-link';

const ADDRESS = '0x976EA74026E726554dB657fA54763abd0C3a0aa9';

describe('needsVerification', () => {
  it('waits until the linked wallets have loaded', () => {
    expect(needsVerification({ walletsLoaded: false, wallets: [], address: ADDRESS, chainId: 31337 })).toBe(false);
  });

  it('skips a wallet already verified on this chain, whatever the letter case', () => {
    expect(needsVerification({
      walletsLoaded: true,
      wallets: [{ address: ADDRESS.toLowerCase(), isVerified: true, chainId: 31337 }],
      address: ADDRESS,
      chainId: 31337,
    })).toBe(false);
  });

  it('asks again for a wallet verified on another chain', () => {
    expect(needsVerification({
      walletsLoaded: true,
      wallets: [{ address: ADDRESS.toLowerCase(), isVerified: true, chainId: 11155111 }],
      address: ADDRESS,
      chainId: 31337,
    })).toBe(true);
  });

  it('asks for a new wallet', () => {
    expect(needsVerification({ walletsLoaded: true, wallets: [], address: ADDRESS, chainId: 31337 })).toBe(true);
  });

  it('does nothing without a connected address', () => {
    expect(needsVerification({ walletsLoaded: true, wallets: [], address: undefined, chainId: 31337 })).toBe(false);
  });
});
