import LandingScreen from "@/screens/onboarding/LandingScreen";
import LoadingScreen from "@/screens/onboarding/LoadingScreen";
import SplashScreen from "@/screens/onboarding/SplashScreen";
import { useAuthStore } from "@/stores/auth.store";
import { useVerificationStore } from "@/stores/verification.store";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

type AppPhase = "loading" | "splash" | "ready";

export default function Index() {
  const { isAuthenticated, checkSession } = useAuthStore();
  const [phase, setPhase] = useState<AppPhase>("loading");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // In poor network conditions `checkSession` can hang on a fetch.
      // Race it against a short timeout so the UI can progress.
      const timeout = new Promise<void>((resolve) =>
        setTimeout(resolve, 5000),
      );

      try {
        await Promise.race([checkSession(), timeout]);
      } finally {
        if (isMounted) {
          // Restore KYC/verification status from backend
          if (useAuthStore.getState().isAuthenticated) {
            useVerificationStore.getState().checkKycStatus().catch(() => {});
          }
          setAuthReady(true);
        }
      }
    };
    initAuth();

    return () => {
      isMounted = false;
    };
  }, [checkSession]);

  // Loading screen → Splash screen after 2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("splash");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Splash screen → Ready after 2.5s more
  useEffect(() => {
    if (phase === "splash") {
      const timer = setTimeout(() => {
        setPhase("ready");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === "loading") {
    return <LoadingScreen />;
  }

  if (phase === "splash") {
    return <SplashScreen />;
  }

  // phase === "ready"
  if (!authReady) {
    // Auth still checking — keep showing splash until done
    return <SplashScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/Home" />;
  }

  return <LandingScreen />;
}
