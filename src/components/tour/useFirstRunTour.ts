import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useVerificationStore } from "@/stores/verification.store";
import { introSteps, verifiedSteps } from "./steps";
import { loadTourState, saveTourState } from "./storage";
import { useTour } from "./TourProvider";

const TAB_PATHS = ["/Home", "/LoanPlans", "/Wallet", "/Records", "/Profile"];
// Let the first tab paint before dimming it
const START_DELAY_MS = 900;

/**
 * Shows the tour the first time a user reaches the tabs, and once more after
 * verification is approved, since that changes Home, Loan Plans and Wallet.
 */
export function useFirstRunTour() {
  const { start, active } = useTour();
  const userId = useAuthStore((s) => s.user?.id);
  const isVerified = useVerificationStore((s) => s.isVerified);
  const kycStatus = useVerificationStore((s) => s.kycStatus);
  const pathname = usePathname();
  const onTab = TAB_PATHS.some((p) => pathname === p || pathname.endsWith(p));
  const deciding = useRef(false);

  useEffect(() => {
    // kycStatus stays null until the first status check answers
    if (!userId || kycStatus === null || !onTab || active || deciding.current) return;
    deciding.current = true;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      const state = await loadTourState(userId);
      if (cancelled) return;
      const steps = !state.introDone ? introSteps(isVerified) : isVerified && !state.sawVerified ? verifiedSteps() : null;
      if (!steps) {
        deciding.current = false;
        return;
      }
      timer = setTimeout(() => {
        start(steps, () => {
          void saveTourState(userId, { introDone: true, sawVerified: state.sawVerified || isVerified });
        });
        deciding.current = false;
      }, START_DELAY_MS);
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      deciding.current = false;
    };
  }, [userId, kycStatus, isVerified, onTab, active, start]);
}

/** Profile's "Replay tutorial". */
export function useReplayTour() {
  const { start } = useTour();
  const isVerified = useVerificationStore((s) => s.isVerified);
  return () => start(introSteps(isVerified));
}
