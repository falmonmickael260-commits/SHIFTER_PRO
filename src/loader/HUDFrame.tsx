import { useEffect, useState } from "react";
import type { LoaderPhase } from "./types";

interface HUDFrameProps {
  phase: LoaderPhase;
  enabled: boolean;
  reducedMotion: boolean;
}

function randomHex(length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += Math.floor(Math.random() * 16).toString(16).toUpperCase();
  }
  return out;
}

function randomCoord(): string {
  const lat = (Math.random() * 90).toFixed(4);
  const lon = (Math.random() * 180).toFixed(4);
  return `${lat}N // ${lon}E`;
}

/**
 * Decorative tactical HUD chrome: corner brackets, thin guide lines and a
 * ticking coordinate / hex readout. Purely cosmetic (aria-hidden) — the
 * readouts refresh on a slow interval, paused entirely under reduced motion.
 */
export function HUDFrame({ phase, enabled, reducedMotion }: HUDFrameProps) {
  const [coord, setCoord] = useState(randomCoord);
  const [hex, setHex] = useState(() => randomHex(6));

  useEffect(() => {
    if (!enabled || reducedMotion) return;
    const interval = window.setInterval(() => {
      setCoord(randomCoord());
      setHex(randomHex(6));
    }, 650);
    return () => window.clearInterval(interval);
  }, [enabled, reducedMotion]);

  if (!enabled) return null;

  return (
    <div className="shifter-loader__hud" aria-hidden="true" data-phase={phase}>
      <span className="shifter-loader__corner shifter-loader__corner--tl" />
      <span className="shifter-loader__corner shifter-loader__corner--tr" />
      <span className="shifter-loader__corner shifter-loader__corner--bl" />
      <span className="shifter-loader__corner shifter-loader__corner--br" />

      <div className="shifter-loader__readout shifter-loader__readout--tl">
        <span>OPS-NET // SECURE</span>
        <span>{coord}</span>
      </div>
      <div className="shifter-loader__readout shifter-loader__readout--br">
        <span>UNIT 0x{hex}</span>
        <span>REGION EU-WEST</span>
      </div>
    </div>
  );
}
