import { formatEther, parseEther } from "viem";

interface OwedParts {
  totalOwed?: string | null;
  principalOwed?: string | null;
  interestOwed?: string | null;
  feesOwed?: string | null;
}

const toWei = (value?: string | null) => (value ? parseEther(String(value)) : 0n);

/**
 * What the borrower owes, exact to the wei. This is the amount a repayment must
 * send; adding floats here left loans a few gwei short of closing.
 */
export function amountOwed(loan: OwedParts): string {
  if (loan.totalOwed) return loan.totalOwed;
  const total = toWei(loan.principalOwed) + toWei(loan.interestOwed) + toWei(loan.feesOwed);
  return formatEther(total);
}

/** Rounded for display only. Never pass this to a transaction. */
export function formatEth(value: string, decimals = 6): string {
  const wei = toWei(value);
  if (wei === 0n) return "0 ETH";
  const threshold = parseEther(`0.${"0".repeat(decimals - 1)}1`);
  if (wei < threshold) return `<${formatEther(threshold)} ETH`;
  return `${Number(formatEther(wei)).toFixed(decimals)} ETH`;
}
