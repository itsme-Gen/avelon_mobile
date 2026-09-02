import { baseSepolia, hardhat } from "wagmi/chains";

/**
 * Single source for the deployment target. Kept free of side effects so the
 * providers and hooks can import it without pulling in AppKit setup.
 *
 * EXPO_PUBLIC_CHAIN_ID=31337 selects the local Hardhat node used for the capstone
 * demo. Anything else, including an unset value, stays on Base Sepolia so a
 * missing variable cannot silently point a wallet at the wrong network.
 */
const isLocal = process.env.EXPO_PUBLIC_CHAIN_ID === "31337";

export const appChain = isLocal ? hardhat : baseSepolia;
export const CHAIN_NAME = isLocal ? "Hardhat (local)" : "Base Sepolia";
export const EXPLORER_BASE = isLocal ? "" : "https://sepolia.basescan.org";

/** Local chains have no block explorer, so callers must not render a link. */
export const HAS_EXPLORER = !isLocal;
