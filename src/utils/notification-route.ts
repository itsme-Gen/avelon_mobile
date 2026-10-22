import type { Href } from "expo-router";

/**
 * Where tapping a push notification lands. Loan updates open the loan list,
 * which shows the right next step for any status (deposit, repay, or just the
 * result); everything else opens the notification list.
 */
export function notificationRoute(data: Record<string, unknown> | null | undefined): Href {
  return typeof data?.loanId === "string" && data.loanId ? "/(tabs)/Records" : ("/notifications" as Href);
}
