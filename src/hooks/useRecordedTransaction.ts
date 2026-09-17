import { useCallback, useEffect, useState } from "react";
import { clearPendingTx, getPendingTx, savePendingTx, type PendingKind, type PendingTx } from "@/utils/pending-tx";
import { isTransient, recordWithRetry } from "@/utils/record-with-retry";
import { useWalletConnect } from "./useWalletConnect";

interface RecordResult {
  success: boolean;
  error?: string;
  alreadyRecorded?: boolean;
}

/**
 * Carry a signed transaction through to the backend: keep its hash, wait for it
 * to be mined, record it with retries, and pick it up again if the app was
 * closed in between.
 */
export function useRecordedTransaction<T extends RecordResult>(
  kind: PendingKind,
  loanId: string | undefined,
  submit: (hash: string, amount?: string) => Promise<T>,
) {
  const { waitForConfirmation } = useWalletConnect();
  const [pending, setPending] = useState<PendingTx | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!loanId) return;
    getPendingTx(kind, loanId).then(setPending).catch(() => setPending(null));
  }, [kind, loanId]);

  const record = useCallback(
    async (tx: PendingTx): Promise<T> => {
      setIsRecording(true);
      try {
        let result = await recordWithRetry(() => submit(tx.hash, tx.amount));
        // A lost response the first time means it is already on record
        if (!result.success && /already been (used|recorded)/i.test(result.error ?? "")) {
          result = { ...result, success: true, alreadyRecorded: true };
        }
        if (loanId && (result.success || !isTransient(result.error))) {
          await clearPendingTx(kind, loanId);
          setPending(null);
        }
        return result;
      } finally {
        setIsRecording(false);
      }
    },
    [kind, loanId, submit],
  );

  const track = useCallback(
    async (hash: string, amount?: string): Promise<T> => {
      const tx = { hash, amount };
      if (loanId) {
        await savePendingTx(kind, loanId, tx);
        setPending(tx);
      }
      setIsRecording(true);
      await waitForConfirmation(hash);
      return record(tx);
    },
    [kind, loanId, record, waitForConfirmation],
  );

  return { pending, isRecording, track, record };
}
