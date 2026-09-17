interface RecordResult {
  success: boolean;
  error?: string;
}

// Errors that mean "not yet", not "no": the chain has not confirmed the
// transaction, the backend is mid-way through it, or the network dropped.
const TRANSIENT = [
  /lacks \d+ confirmation/i,
  /fewer than \d+ confirmation/i,
  /still being processed/i,
  /network error/i,
  /could not be recorded yet/i,
  /try again in a minute/i,
];

export function isTransient(error?: string): boolean {
  return !!error && TRANSIENT.some((pattern) => pattern.test(error));
}

/** Ask the backend to record a transaction until it succeeds or says no. */
export async function recordWithRetry<T extends RecordResult>(
  submit: () => Promise<T>,
  { attempts = 6, delayMs = 3000 }: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  let result = await submit();
  for (let attempt = 1; attempt < attempts && !result.success && isTransient(result.error); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    result = await submit();
  }
  return result;
}
