import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { appChain } from "../config/chain";

const queryClient = new QueryClient();
const webConfig = createConfig({
  chains: [appChain],
  connectors: [],
  transports: {
    [appChain.id]: http(),
  },
});

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={webConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
