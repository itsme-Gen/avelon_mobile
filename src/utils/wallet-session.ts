import { disconnect } from "@wagmi/core";

/** Drop the WalletConnect session so the next person to sign in starts clean. */
export async function endWalletSession(): Promise<void> {
  try {
    const { wagmiConfig } = await import("@/config/wagmi");
    await disconnect(wagmiConfig);
  } catch (error) {
    console.warn("[Wallet] Could not end the wallet session:", error);
  }
}
