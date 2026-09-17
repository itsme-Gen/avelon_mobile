import AsyncStorage from "@react-native-async-storage/async-storage";

export type PendingKind = "collateral" | "repayment";

export interface PendingTx {
  hash: string;
  amount?: string;
  savedAt?: number;
}

const keyFor = (kind: PendingKind, loanId: string) => `avelon:pending-tx:${kind}:${loanId}`;

// A signed transaction is kept until the backend has recorded it. If the app is
// killed while the user is in their wallet, the hash is still here on return.
export async function savePendingTx(kind: PendingKind, loanId: string, tx: PendingTx): Promise<void> {
  await AsyncStorage.setItem(keyFor(kind, loanId), JSON.stringify({ ...tx, savedAt: Date.now() }));
}

export async function getPendingTx(kind: PendingKind, loanId: string): Promise<PendingTx | null> {
  const raw = await AsyncStorage.getItem(keyFor(kind, loanId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingTx;
    return typeof parsed?.hash === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearPendingTx(kind: PendingKind, loanId: string): Promise<void> {
  await AsyncStorage.removeItem(keyFor(kind, loanId));
}
