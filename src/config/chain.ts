import { baseSepolia } from "wagmi/chains";

/**
 * Single source for the deployment target. Kept free of side effects so the
 * providers and hooks can import it without pulling in AppKit setup.
 */
export const appChain = baseSepolia;
export const CHAIN_NAME = "Base Sepolia";
export const EXPLORER_BASE = "https://sepolia.basescan.org";
