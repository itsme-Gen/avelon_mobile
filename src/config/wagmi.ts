import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAppKit } from "@reown/appkit-react-native";
import { WagmiAdapter, formatNetwork } from "@reown/appkit-wagmi-react-native";
import { appChain } from "./chain";

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID!;

if (!projectId) {
  throw new Error("EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID is required");
}

const metadata = {
  name: "Avelon",
  description: "Decentralized Lending Platform",
  url: "https://avelon.app",
  icons: ["https://avelon.app/icon.png"],
  redirect: {
    native: "avelon://",
  },
};

// Convert wagmi chain → Reown AppKit network format
const appNetwork = formatNetwork(appChain);

// Create the wagmi adapter for EVM chains
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [appNetwork] as any,
});

// Export the wagmi config from the adapter for WagmiProvider
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Initialise the Reown AppKit singleton
export const appKit = createAppKit({
  projectId,
  metadata,
  adapters: [wagmiAdapter],
  networks: [appNetwork],
  defaultNetwork: appNetwork,
  storage: AsyncStorage as any,
});
