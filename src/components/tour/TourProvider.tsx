import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Dimensions, type View } from "react-native";
import { useAuthStore } from "@/stores/auth.store";
import type { Rect } from "./geometry";
import type { TourStep } from "./steps";
import { TourOverlay } from "./TourOverlay";

type Measurable = Pick<View, "measureInWindow">;

interface TourApi {
  active: boolean;
  start: (steps: TourStep[], onDone?: () => void) => void;
  register: (id: string, node: Measurable) => () => void;
}

const TourContext = createContext<TourApi | null>(null);

// How long a step waits for its screen to mount and lay out before falling back
const FIND_TIMEOUT_MS = 2500;
const FIND_INTERVAL_MS = 120;
const SETTLE_MS = 350;

function measure(node: Measurable): Promise<Rect | null> {
  return new Promise((resolve) => {
    try {
      node.measureInWindow((x, y, width, height) => {
        const screen = Dimensions.get("window");
        const visible =
          width > 0 && height > 0 && x < screen.width && y < screen.height && x + width > 0 && y + height > 0;
        resolve(visible ? { x, y, width, height } : null);
      });
    } catch {
      resolve(null);
    }
  });
}

export function TourProvider({ children }: { children: ReactNode }) {
  // Several mounted screens can carry the same target (each tab has a bell), so
  // keep every node and use whichever one is actually on screen
  const targets = useRef(new Map<string, Set<Measurable>>()).current;
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [hole, setHole] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);
  const onDoneRef = useRef<(() => void) | undefined>(undefined);

  const register = useCallback(
    (id: string, node: Measurable) => {
      const set = targets.get(id) ?? new Set<Measurable>();
      set.add(node);
      targets.set(id, set);
      return () => {
        set.delete(node);
      };
    },
    [targets],
  );

  const find = useCallback(
    async (id: string) => {
      for (const node of targets.get(id) ?? []) {
        const rect = await measure(node);
        if (rect) return rect;
      }
      return null;
    },
    [targets],
  );

  const clear = useCallback(() => {
    setSteps(null);
    setIndex(0);
    setHole(null);
    setReady(false);
  }, []);

  const finish = useCallback(() => {
    clear();
    const done = onDoneRef.current;
    onDoneRef.current = undefined;
    done?.();
  }, [clear]);

  // This provider sits above the router, so a tour outlives a logout. Drop it
  // unfinished, or the next account's Skip would mark the previous one done.
  const userId = useAuthStore((s) => s.user?.id);
  useEffect(() => {
    onDoneRef.current = undefined;
    clear();
  }, [userId, clear]);

  const start = useCallback((next: TourStep[], onDone?: () => void) => {
    if (next.length === 0) return;
    onDoneRef.current = onDone;
    setIndex(0);
    setHole(null);
    setReady(false);
    setSteps(next);
  }, []);

  const step = steps?.[index];

  // Bring the step's screen up, then wait for its target to lay out
  useEffect(() => {
    if (!step) return;
    let cancelled = false;
    setReady(false);

    if (step.route) router.navigate(step.route);

    (async () => {
      await new Promise((r) => setTimeout(r, SETTLE_MS));
      const deadline = Date.now() + FIND_TIMEOUT_MS;
      let rect: Rect | null = null;
      while (!cancelled && Date.now() < deadline) {
        rect = await find(step.target);
        if (rect) break;
        await new Promise((r) => setTimeout(r, FIND_INTERVAL_MS));
      }
      if (!rect && step.fallbackTarget && !cancelled) rect = await find(step.fallbackTarget);
      if (cancelled) return;
      // No target at all still shows the card, centred, so the tour never stalls
      setHole(rect);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [step, find]);

  const next = useCallback(() => {
    if (!steps) return;
    if (index >= steps.length - 1) finish();
    else setIndex((i) => i + 1);
  }, [steps, index, finish]);

  const api = useMemo<TourApi>(() => ({ active: !!steps, start, register }), [steps, start, register]);

  return (
    <TourContext.Provider value={api}>
      {children}
      {step && (
        <TourOverlay
          step={step}
          index={index}
          total={steps!.length}
          hole={hole}
          ready={ready}
          onNext={next}
          onSkip={finish}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTour(): TourApi {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside TourProvider");
  return ctx;
}

/**
 * Marks a view as a tour target. Attach the returned ref to a View that
 * renders its own box (collapsable={false} on Android).
 */
export function useTourTarget(id: string, enabled = true) {
  const ctx = useContext(TourContext);
  const nodeRef = useRef<View | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback(
    (node: View | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      nodeRef.current = node;
      if (node && ctx && enabled) cleanupRef.current = ctx.register(id, node);
    },
    [ctx, id, enabled],
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  return ref;
}
