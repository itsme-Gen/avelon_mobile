// The web build connects through the browser extension, which keeps its own
// session per site; there is nothing app-side to end.
export async function endWalletSession(): Promise<void> {}
