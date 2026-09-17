interface LinkedWallet {
  address: string;
  isVerified?: boolean;
  chainId?: number;
}

/**
 * Whether the connected wallet still has to sign the ownership message.
 * Nothing is decided until the linked wallets have loaded, or a restored
 * session would ask for a signature every time the screen opens.
 */
export function needsVerification({
  walletsLoaded,
  wallets,
  address,
  chainId,
}: {
  walletsLoaded: boolean;
  wallets: LinkedWallet[];
  address?: string;
  chainId: number;
}): boolean {
  if (!walletsLoaded || !address) return false;
  const lower = address.toLowerCase();
  // A wallet verified on another chain cannot be used for loans here
  return !wallets.some(
    (w) => w.address.toLowerCase() === lower && w.isVerified !== false && w.chainId === chainId,
  );
}
