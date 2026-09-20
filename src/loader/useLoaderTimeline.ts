import { useEffect, useRef, useState } from "react";
import type { LoaderPhase, ShifterLoaderTimings } from "./types";

const PHASE_ORDER: LoaderPhase[] = [
  "boot",
  "identify",
  "impact",
  "connection",
  "ready",
  "exit",
];

interface UseLoaderTimelineResult {
  phase: LoaderPhase;
  /** Elapsed ms since the current phase started; drives sub-step reveals. */
  phaseElapsed: number;
}

/**
 * Drives the loader's phase state machine off a single timing config.
 * Each phase auto-advances to the next after its configured duration;
 * "exit" calls onExitComplete once its own duration has elapsed.
 */
export function useLoaderTimeline(
  timings: ShifterLoaderTimings,
  onExitComplete: () => void,
): UseLoaderTimelineResult {
  const [phase, setPhase] = useState<LoaderPhase>("boot");
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const onExitCompleteRef = useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;

  useEffect(() => {
    const index = PHASE_ORDER.indexOf(phase);
    const duration = timings[phase];

    setPhaseElapsed(0);
    const startedAt = performance.now();
    let raf = 0;
    const tick = () => {
      setPhaseElapsed(performance.now() - startedAt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const advance = window.setTimeout(() => {
      const next = PHASE_ORDER[index + 1];
      if (next) {
        setPhase(next);
      } else {
        onExitCompleteRef.current();
      }
    }, duration);

    return () => {
      window.clearTimeout(advance);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return { phase, phaseElapsed };
}
