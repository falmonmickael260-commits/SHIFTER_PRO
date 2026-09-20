import { useEffect, useRef } from "react";
import type { LoaderPhase, ShifterLoaderColors, ShifterLoaderEffects } from "./types";

/** "#rrggbb" -> "r, g, b" for use inside rgba() strings. */
function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

interface BackgroundFXProps {
  colors: ShifterLoaderColors;
  effects: ShifterLoaderEffects;
  phase: LoaderPhase;
  particleDensity: number;
  reducedMotion: boolean;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  alpha: number;
}

interface SmokeBlob {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
}

/**
 * Full-bleed canvas: drifting dust particles, soft smoke blobs and a vertical
 * scan sweep. Runs a single rAF loop, pauses when the tab is hidden, and
 * scales particle count down for smaller / reduced-motion viewports.
 */
export function BackgroundFX({
  colors,
  effects,
  phase,
  particleDensity,
  reducedMotion,
}: BackgroundFXProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const phaseStartRef = useRef(performance.now());

  useEffect(() => {
    phaseStartRef.current = performance.now();
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const steelRgb = hexToRgbTriplet(colors.steel);
    const whiteRgb = hexToRgbTriplet(colors.white);
    const accentRgb = hexToRgbTriplet(colors.accent);

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const isSmallViewport = window.innerWidth < 640;
    const densityScale = reducedMotion ? 0.25 : isSmallViewport ? 0.5 : 1;
    const particleCount = effects.particles
      ? Math.round(particleDensity * densityScale)
      : 0;

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 10 + 4,
      drift: (Math.random() - 0.5) * 6,
      alpha: Math.random() * 0.35 + 0.08,
    }));

    const smokeCount = effects.smoke ? (reducedMotion ? 1 : 3) : 0;
    const smoke: SmokeBlob[] = Array.from({ length: smokeCount }, () => ({
      x: Math.random() * width,
      y: height * (0.5 + Math.random() * 0.5),
      r: Math.max(width, height) * (0.35 + Math.random() * 0.25),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 2,
      alpha: 0.05 + Math.random() * 0.04,
    }));

    let scanY = 0;
    let raf = 0;
    let lastTime = performance.now();
    let running = true;

    const draw = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      if (effects.smoke) {
        for (const blob of smoke) {
          if (!reducedMotion) {
            blob.x += blob.vx * dt;
            blob.y += blob.vy * dt;
            if (blob.x < -blob.r) blob.x = width + blob.r;
            if (blob.x > width + blob.r) blob.x = -blob.r;
          }
          const gradient = ctx.createRadialGradient(
            blob.x,
            blob.y,
            0,
            blob.x,
            blob.y,
            blob.r,
          );
          gradient.addColorStop(0, `rgba(${steelRgb},${blob.alpha})`);
          gradient.addColorStop(1, `rgba(${steelRgb},0)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }
      }

      if (effects.particles) {
        for (const p of particles) {
          if (!reducedMotion) {
            p.y -= p.speed * dt;
            p.x += p.drift * dt;
            if (p.y < -4) {
              p.y = height + 4;
              p.x = Math.random() * width;
            }
            if (p.x < -4) p.x = width + 4;
            if (p.x > width + 4) p.x = -4;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${whiteRgb},${p.alpha})`;
          ctx.fill();
        }
      }

      if (effects.flash && phaseRef.current === "impact" && !reducedMotion) {
        const sinceImpact = (now - phaseStartRef.current) / 1000;
        const burstAlpha = Math.max(0, 0.22 * (1 - sinceImpact / 0.4));
        if (burstAlpha > 0) {
          const burst = ctx.createRadialGradient(
            width / 2,
            height / 2,
            0,
            width / 2,
            height / 2,
            Math.max(width, height) * 0.6,
          );
          burst.addColorStop(0, `rgba(${accentRgb},${burstAlpha})`);
          burst.addColorStop(1, `rgba(${accentRgb},0)`);
          ctx.fillStyle = burst;
          ctx.fillRect(0, 0, width, height);
        }
      }

      if (effects.scanlines && !reducedMotion) {
        scanY += dt * height * 0.22;
        if (scanY > height * 1.3) scanY = -height * 0.3;
        const scanGradient = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
        scanGradient.addColorStop(0, `rgba(${accentRgb},0)`);
        scanGradient.addColorStop(0.5, `rgba(${accentRgb},0.05)`);
        scanGradient.addColorStop(1, `rgba(${accentRgb},0)`);
        ctx.fillStyle = scanGradient;
        ctx.fillRect(0, scanY - 40, width, 80);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);

    const handleVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) {
        lastTime = performance.now();
        raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, effects, particleDensity, reducedMotion]);

  return <canvas ref={canvasRef} className="shifter-loader__canvas" aria-hidden="true" />;
}
