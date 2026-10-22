import type { Href } from "expo-router";

export interface TourStep {
  id: string;
  // Tour target to spotlight, and the tab icon to fall back to if that screen
  // doesn't show the target (for example before verification)
  target: string;
  fallbackTarget?: string;
  route?: Href;
  title: string;
  body: string;
}

const STEPS: Record<string, TourStep> = {
  home: {
    id: "home",
    target: "home-overview",
    route: "/(tabs)/Home",
    title: "Your home screen",
    body: "Check your wallet balance and the live ETH price here.",
  },
  verify: {
    id: "verify",
    target: "home-verify",
    route: "/(tabs)/Home",
    title: "Verify your identity",
    body: "Verify your identity here. You need it before you can borrow.",
  },
  apply: {
    id: "apply",
    target: "home-apply",
    route: "/(tabs)/Home",
    title: "Apply for a loan",
    body: "Tap here to apply for a loan.",
  },
  plans: {
    id: "plans",
    target: "plans-first",
    fallbackTarget: "tab-LoanPlans",
    route: "/(tabs)/LoanPlans",
    title: "Loan plans",
    body: "Pick a plan, set the amount and term, then apply.",
  },
  wallet: {
    id: "wallet",
    target: "wallet-card",
    fallbackTarget: "tab-Wallet",
    route: "/(tabs)/Wallet",
    title: "Your wallet",
    body: "Connect your wallet here. You sign your stake and repayments with it.",
  },
  records: {
    id: "records",
    target: "records-tabs",
    fallbackTarget: "tab-Records",
    route: "/(tabs)/Records",
    title: "Records",
    body: "Open a loan here to deposit your stake, repay, or see its history.",
  },
  bell: {
    id: "bell",
    target: "notifications-bell",
    route: "/(tabs)/Records",
    title: "Notifications",
    body: "Loan decisions, due dates and price alerts arrive here.",
  },
  profile: {
    id: "profile",
    target: "profile-settings",
    fallbackTarget: "tab-Profile",
    route: "/(tabs)/Profile",
    title: "Profile and settings",
    body: "Edit your details, choose your alerts, or replay this tour.",
  },
};

/** The first-run tour. A borrower who still has to verify sees where to start. */
export function introSteps(isVerified: boolean): TourStep[] {
  const ids = isVerified
    ? ["home", "apply", "plans", "wallet", "records", "bell", "profile"]
    : ["home", "verify", "plans", "wallet", "records", "bell", "profile"];
  return ids.map((id) => STEPS[id]);
}

/** What changes on screen once verification is approved. */
export function verifiedSteps(): TourStep[] {
  return ["apply", "plans", "wallet"].map((id) => STEPS[id]);
}
