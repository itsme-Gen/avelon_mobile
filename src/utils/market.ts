// Helpers for the ETH price card on the Wallet tab.

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "EXTREME";

// Up to n points spread evenly across the series, always keeping the first and
// the newest, so the chart ends at the latest price.
export function samplePoints<T>(points: T[], n: number): T[] {
  if (points.length <= n) return points;
  if (n <= 1) return points.slice(-1);
  return Array.from({ length: n }, (_, k) => points[Math.round((k * (points.length - 1)) / (n - 1))]);
}

// Full class names, so NativeWind's scanner can see them
const RISK_STYLES: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  LOW: { bg: "bg-green-100", text: "text-green-700", label: "Low risk" },
  MODERATE: { bg: "bg-amber-100", text: "text-amber-700", label: "Moderate risk" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-700", label: "High risk" },
  EXTREME: { bg: "bg-red-100", text: "text-red-700", label: "Extreme risk" },
};

export function riskStyle(level: string | undefined) {
  return RISK_STYLES[level as RiskLevel] ?? { bg: "bg-gray-100", text: "text-gray-600", label: "Risk unknown" };
}

// horizonVolatility is the standard deviation of the log return over the whole
// horizon, as a fraction. About ±1σ is the move the 68% range spans.
export function formatMove(horizonVolatility: number): string {
  return `±${(horizonVolatility * 100).toFixed(1)}%`;
}

// The 68% range, P·e^(±σ), the AI service's own formula. Centred on the price the
// card shows rather than the AI's, which can be a saved snapshot weeks old when
// CoinGecko is unreachable from the AI service.
export function priceRange(pricePHP: number, horizonVolatility: number): { lower: number; upper: number } {
  return {
    lower: pricePHP * Math.exp(-horizonVolatility),
    upper: pricePHP * Math.exp(horizonVolatility),
  };
}
