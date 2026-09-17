import { baseSepolia, hardhat, sepolia } from "wagmi/chains";

/**
 * Single source for the deployment target. Kept free of side effects so the
 * providers and hooks can import it without pulling in AppKit setup.
 *
 * EXPO_PUBLIC_CHAIN_ID picks the chain:
 *   31337    — the local Hardhat node
 *   11155111 — Ethereum Sepolia
 *   anything else, including unset — Base Sepolia, the deployment target
 *
 * Hardhat's own RPC is http://127.0.0.1:8545, which on a phone means the phone.
 * For 31337 on a real device, set EXPO_PUBLIC_RPC_URL to the backend's
 * /api/v1/rpc proxy behind a tunnel. It becomes the URL the wallet is given.
 */
const CHAIN_ID = process.env.EXPO_PUBLIC_CHAIN_ID;

const isLocal = CHAIN_ID === "31337";
const isSepolia = CHAIN_ID === "11155111";
const RPC_URL = process.env.EXPO_PUBLIC_RPC_URL;
const isRemoteLocal = isLocal && !!RPC_URL;

// Same name the reviewer handout uses for the MetaMask network.
const localChain = RPC_URL
  ? {
      ...hardhat,
      name: "Avelon Local",
      rpcUrls: { default: { http: [RPC_URL] } },
    }
  : hardhat;

export const appChain = isLocal ? localChain : isSepolia ? sepolia : baseSepolia;

export const CHAIN_NAME = isLocal
  ? isRemoteLocal
    ? "Avelon Local"
    : "Hardhat (local)"
  : isSepolia
    ? "Sepolia"
    : "Base Sepolia";

export const EXPLORER_BASE = isLocal
  ? ""
  : isSepolia
    ? "https://sepolia.etherscan.io"
    : "https://sepolia.basescan.org";

/** Local chains have no block explorer, so callers must not render a link. */
export const HAS_EXPLORER = !isLocal;
