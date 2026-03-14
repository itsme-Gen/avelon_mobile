/**
 * web3.service.test.ts
 *
 * TDD test suite for WalletConnect integration (web3.service.ts)
 *
 * User Journeys:
 *   - As a borrower, I want to deposit collateral without leaving the app,
 *     so I don't need Remix or a browser tab.
 *   - As a borrower, I want the app to auto-switch to Sepolia testnet,
 *     so my transaction never lands on Ethereum mainnet by mistake.
 *   - As a borrower, I want to repay a loan directly from the app,
 *     so the txHash is submitted automatically without copy-pasting.
 *   - As a user, I want a clear error message when I cancel or lack funds,
 *     so I know what went wrong.
 */

// ─── Module-level mocks (hoisted by Jest) ─────────────────────────────────────

jest.mock('react-native-get-random-values', () => {});

jest.mock('@/config', () => ({
  WALLETCONNECT_CONFIG: {
    projectId: 'test-project-id',
    metadata: { name: 'Test', description: 'Test App', url: 'https://test.com', icons: [] },
  },
  COLLATERAL_MANAGER_ADDRESS: '0xCollateralManagerAddress',
  TREASURY_ADDRESS: '0xTreasuryAddress',
  SEPOLIA_CHAIN_ID: 11155111,
}));

jest.mock('@reown/appkit-wagmi-react-native', () => ({
  WagmiAdapter: jest.fn().mockImplementation(() => ({
    wagmiConfig: {},
    networks: [],
  })),
}));

jest.mock('@reown/appkit-react-native', () => ({
  createAppKit: jest.fn(() => ({})),
  AppKitProvider: ({ children }: { children: React.ReactNode }) => children,
  AppKit: () => null,
  useAppKit: jest.fn(),
}));

jest.mock('wagmi', () => ({
  useWriteContract: jest.fn(),
  useSendTransaction: jest.fn(),
  useSwitchChain: jest.fn(),
  useAccount: jest.fn(),
  createConfig: jest.fn(() => ({})),
  WagmiProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('wagmi/chains', () => ({
  sepolia: { id: 11155111, name: 'Sepolia', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
}));

jest.mock('viem', () => ({
  parseEther: jest.fn((v: string) => BigInt(Math.floor(parseFloat(v) * 1e18))),
  formatUnits: jest.fn(),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { renderHook, act } from '@testing-library/react-native';
import { useWriteContract, useSendTransaction, useSwitchChain, useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit-react-native';
import { parseEther } from 'viem';
import { useDepositCollateral, useRepayLoan, useWalletConnection } from '../web3.service';

// ─── Typed mock references ────────────────────────────────────────────────────

const mockUseWriteContract = useWriteContract as jest.Mock;
const mockUseSendTransaction = useSendTransaction as jest.Mock;
const mockUseSwitchChain = useSwitchChain as jest.Mock;
const mockUseAccount = useAccount as jest.Mock;
const mockUseAppKit = useAppKit as jest.Mock;

const SEPOLIA_CHAIN_ID = 11155111;
const COLLATERAL_MANAGER_ADDRESS = '0xCollateralManagerAddress';
const TREASURY_ADDRESS = '0xTreasuryAddress';

// ─── Default mock setup helper ────────────────────────────────────────────────

function setupMocks(overrides: {
  switchChainAsync?: jest.Mock;
  writeContractAsync?: jest.Mock;
  sendTransactionAsync?: jest.Mock;
  isConnected?: boolean;
  address?: string;
} = {}) {
  const switchChainAsync = overrides.switchChainAsync ?? jest.fn().mockResolvedValue(undefined);
  const writeContractAsync = overrides.writeContractAsync ?? jest.fn().mockResolvedValue('0xdefaultdeposittx');
  const sendTransactionAsync = overrides.sendTransactionAsync ?? jest.fn().mockResolvedValue('0xdefaultrepaytx');

  mockUseSwitchChain.mockReturnValue({ switchChainAsync });
  mockUseWriteContract.mockReturnValue({ writeContractAsync, isPending: false });
  mockUseSendTransaction.mockReturnValue({ sendTransactionAsync, isPending: false });
  mockUseAccount.mockReturnValue({
    isConnected: overrides.isConnected ?? false,
    address: overrides.address,
  });
  mockUseAppKit.mockReturnValue({
    open: jest.fn(),
    close: jest.fn(),
    disconnect: jest.fn(),
    switchNetwork: jest.fn(),
  });

  return { switchChainAsync, writeContractAsync, sendTransactionAsync };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// useDepositCollateral
// =============================================================================

describe('useDepositCollateral', () => {
  describe('deposit() — happy path', () => {
    it('switches to Sepolia (chainId 11155111) before sending the transaction', async () => {
      const { switchChainAsync } = setupMocks();

      const { result } = renderHook(() => useDepositCollateral());
      await act(async () => {
        await result.current.deposit(42, '0.5');
      });

      expect(switchChainAsync).toHaveBeenCalledWith({ chainId: SEPOLIA_CHAIN_ID });
    });

    it('switches chain BEFORE calling writeContractAsync (call order matters)', async () => {
      const callOrder: string[] = [];
      const switchChainAsync = jest.fn().mockImplementation(async () => {
        callOrder.push('switchChain');
      });
      const writeContractAsync = jest.fn().mockImplementation(async () => {
        callOrder.push('writeContract');
        return '0xtx';
      });
      setupMocks({ switchChainAsync, writeContractAsync });

      const { result } = renderHook(() => useDepositCollateral());
      await act(async () => {
        await result.current.deposit(1, '0.1');
      });

      expect(callOrder).toEqual(['switchChain', 'writeContract']);
    });

    it('calls writeContractAsync targeting the CollateralManager contract', async () => {
      const { writeContractAsync } = setupMocks();

      const { result } = renderHook(() => useDepositCollateral());
      await act(async () => {
        await result.current.deposit(5, '0.25');
      });

      expect(writeContractAsync).toHaveBeenCalledWith(
        expect.objectContaining({ address: COLLATERAL_MANAGER_ADDRESS })
      );
    });

    it('calls depositCollateral function with the correct on-chain loanId', async () => {
      const { writeContractAsync } = setupMocks();
      const contractLoanId = 99;

      const { result } = renderHook(() => useDepositCollateral());
      await act(async () => {
        await result.current.deposit(contractLoanId, '1.0');
      });

      expect(writeContractAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'depositCollateral',
          args: [contractLoanId],
        })
      );
    });

    it('sends the exact ETH value as a BigInt via parseEther', async () => {
      const { writeContractAsync } = setupMocks();

      const { result } = renderHook(() => useDepositCollateral());
      await act(async () => {
        await result.current.deposit(1, '0.75');
      });

      expect(writeContractAsync).toHaveBeenCalledWith(
        expect.objectContaining({ value: parseEther('0.75') })
      );
    });

    it('enforces Sepolia by passing chainId: 11155111 in the contract call', async () => {
      const { writeContractAsync } = setupMocks();

      const { result } = renderHook(() => useDepositCollateral());
      await act(async () => {
        await result.current.deposit(1, '0.1');
      });

      expect(writeContractAsync).toHaveBeenCalledWith(
        expect.objectContaining({ chainId: SEPOLIA_CHAIN_ID })
      );
    });

    it('returns the txHash from writeContractAsync', async () => {
      const expectedTxHash = '0xdeposithash123abc';
      setupMocks({ writeContractAsync: jest.fn().mockResolvedValue(expectedTxHash) });

      const { result } = renderHook(() => useDepositCollateral());
      let txHash: string | undefined;
      await act(async () => {
        txHash = await result.current.deposit(1, '0.5');
      });

      expect(txHash).toBe(expectedTxHash);
    });
  });

  describe('deposit() — error cases', () => {
    it('throws "Loan not yet synced to blockchain" when contractLoanId is null', async () => {
      setupMocks();

      const { result } = renderHook(() => useDepositCollateral());

      await expect(
        act(async () => {
          await result.current.deposit(null as any, '0.5');
        })
      ).rejects.toThrow('Loan not yet synced to blockchain');
    });

    it('does NOT call writeContractAsync when contractLoanId is null', async () => {
      const { writeContractAsync } = setupMocks();

      const { result } = renderHook(() => useDepositCollateral());
      await act(async () => {
        try { await result.current.deposit(null as any, '0.5'); } catch {}
      });

      expect(writeContractAsync).not.toHaveBeenCalled();
    });

    it('propagates error when wallet rejects (code 4001)', async () => {
      const rejection = Object.assign(new Error('User rejected'), { code: 4001 });
      setupMocks({ writeContractAsync: jest.fn().mockRejectedValue(rejection) });

      const { result } = renderHook(() => useDepositCollateral());

      await expect(
        act(async () => { await result.current.deposit(1, '0.5'); })
      ).rejects.toThrow('User rejected');
    });

    it('propagates error when chain switch fails', async () => {
      setupMocks({
        switchChainAsync: jest.fn().mockRejectedValue(new Error('Chain switch rejected')),
      });

      const { result } = renderHook(() => useDepositCollateral());

      await expect(
        act(async () => { await result.current.deposit(1, '0.5'); })
      ).rejects.toThrow('Chain switch rejected');
    });
  });
});

// =============================================================================
// useRepayLoan
// =============================================================================

describe('useRepayLoan', () => {
  describe('repay() — happy path', () => {
    it('switches to Sepolia (chainId 11155111) before sending ETH', async () => {
      const { switchChainAsync } = setupMocks();

      const { result } = renderHook(() => useRepayLoan());
      await act(async () => {
        await result.current.repay('0.05');
      });

      expect(switchChainAsync).toHaveBeenCalledWith({ chainId: SEPOLIA_CHAIN_ID });
    });

    it('sends ETH to TREASURY_ADDRESS', async () => {
      const { sendTransactionAsync } = setupMocks();

      const { result } = renderHook(() => useRepayLoan());
      await act(async () => {
        await result.current.repay('0.05');
      });

      expect(sendTransactionAsync).toHaveBeenCalledWith(
        expect.objectContaining({ to: TREASURY_ADDRESS })
      );
    });

    it('sends the exact ETH value as a BigInt via parseEther', async () => {
      const { sendTransactionAsync } = setupMocks();

      const { result } = renderHook(() => useRepayLoan());
      await act(async () => {
        await result.current.repay('0.03');
      });

      expect(sendTransactionAsync).toHaveBeenCalledWith(
        expect.objectContaining({ value: parseEther('0.03') })
      );
    });

    it('enforces Sepolia by passing chainId: 11155111 in the transaction', async () => {
      const { sendTransactionAsync } = setupMocks();

      const { result } = renderHook(() => useRepayLoan());
      await act(async () => {
        await result.current.repay('0.02');
      });

      expect(sendTransactionAsync).toHaveBeenCalledWith(
        expect.objectContaining({ chainId: SEPOLIA_CHAIN_ID })
      );
    });

    it('returns the txHash from sendTransactionAsync', async () => {
      const expectedTxHash = '0xrepayhash456def';
      setupMocks({ sendTransactionAsync: jest.fn().mockResolvedValue(expectedTxHash) });

      const { result } = renderHook(() => useRepayLoan());
      let txHash: string | undefined;
      await act(async () => {
        txHash = await result.current.repay('0.01');
      });

      expect(txHash).toBe(expectedTxHash);
    });
  });

  describe('repay() — error cases', () => {
    it('propagates error when user rejects the transaction', async () => {
      setupMocks({
        sendTransactionAsync: jest.fn().mockRejectedValue(new Error('Transaction rejected')),
      });

      const { result } = renderHook(() => useRepayLoan());

      await expect(
        act(async () => { await result.current.repay('0.05'); })
      ).rejects.toThrow('Transaction rejected');
    });

    it('propagates error when chain switch fails', async () => {
      setupMocks({
        switchChainAsync: jest.fn().mockRejectedValue(new Error('Switch failed')),
      });

      const { result } = renderHook(() => useRepayLoan());

      await expect(
        act(async () => { await result.current.repay('0.05'); })
      ).rejects.toThrow('Switch failed');
    });

    it('does NOT call sendTransactionAsync when chain switch fails', async () => {
      const { sendTransactionAsync } = setupMocks({
        switchChainAsync: jest.fn().mockRejectedValue(new Error('Switch failed')),
      });

      const { result } = renderHook(() => useRepayLoan());
      await act(async () => {
        try { await result.current.repay('0.05'); } catch {}
      });

      expect(sendTransactionAsync).not.toHaveBeenCalled();
    });
  });
});

// =============================================================================
// useWalletConnection
// =============================================================================

describe('useWalletConnection', () => {
  it('exposes an open function to trigger the WalletConnect modal', () => {
    setupMocks();
    const { result } = renderHook(() => useWalletConnection());
    expect(typeof result.current.open).toBe('function');
  });

  it('exposes isConnected reflecting wallet connection state', () => {
    setupMocks({ isConnected: false });
    const { result } = renderHook(() => useWalletConnection());
    expect(result.current.isConnected).toBe(false);
  });

  it('reflects isConnected: true when wallet is connected', () => {
    setupMocks({ isConnected: true, address: '0xWallet123' });
    const { result } = renderHook(() => useWalletConnection());
    expect(result.current.isConnected).toBe(true);
  });

  it('exposes the wallet address when connected', () => {
    const walletAddress = '0xWallet123abc';
    setupMocks({ isConnected: true, address: walletAddress });
    const { result } = renderHook(() => useWalletConnection());
    expect(result.current.address).toBe(walletAddress);
  });

  it('address is undefined when not connected', () => {
    setupMocks({ isConnected: false });
    const { result } = renderHook(() => useWalletConnection());
    expect(result.current.address).toBeUndefined();
  });
});

// =============================================================================
// Sepolia enforcement — cross-cutting concern
// =============================================================================

describe('Sepolia enforcement (prevents mainnet transactions)', () => {
  it('deposit always uses chainId 11155111 — never mainnet (1)', async () => {
    const { switchChainAsync } = setupMocks();

    const { result } = renderHook(() => useDepositCollateral());
    await act(async () => { await result.current.deposit(1, '0.1'); });

    expect(switchChainAsync.mock.calls[0][0].chainId).toBe(11155111);
    expect(switchChainAsync.mock.calls[0][0].chainId).not.toBe(1);
  });

  it('repay always uses chainId 11155111 — never mainnet (1)', async () => {
    const { switchChainAsync } = setupMocks();

    const { result } = renderHook(() => useRepayLoan());
    await act(async () => { await result.current.repay('0.05'); });

    expect(switchChainAsync.mock.calls[0][0].chainId).toBe(11155111);
    expect(switchChainAsync.mock.calls[0][0].chainId).not.toBe(1);
  });

  it('deposit writeContractAsync chainId arg is 11155111 — never mainnet (1)', async () => {
    const { writeContractAsync } = setupMocks();

    const { result } = renderHook(() => useDepositCollateral());
    await act(async () => { await result.current.deposit(1, '0.1'); });

    const callArgs = writeContractAsync.mock.calls[0][0];
    expect(callArgs.chainId).toBe(11155111);
    expect(callArgs.chainId).not.toBe(1);
  });

  it('repay sendTransactionAsync chainId arg is 11155111 — never mainnet (1)', async () => {
    const { sendTransactionAsync } = setupMocks();

    const { result } = renderHook(() => useRepayLoan());
    await act(async () => { await result.current.repay('0.05'); });

    const callArgs = sendTransactionAsync.mock.calls[0][0];
    expect(callArgs.chainId).toBe(11155111);
    expect(callArgs.chainId).not.toBe(1);
  });
});
