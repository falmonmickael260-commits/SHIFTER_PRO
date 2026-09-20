import { useEffect, useRef } from "react";
import { colorTokens, hexToRgbTriplet } from "../design/tokens";
import { useReducedMotion } from "../loader/useReducedMotion";

interface AtmosphereFXProps {
  /** Base particle count at a 1440px-wide viewport; auto-scaled otherwise. */
  particleDensity?: number;
  className?: string;
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
 * Continuous ambient canvas for post-loader sections — drifting dust,
 * soft smoke, a slow diagonal scan sweep. Same visual language as the
 * loader's BackgroundFX (deliberately not shared code — the loader stays
 * untouched — but same recipe, same tokens).
 */
export function AtmosphereFX({ particleDensity = 46, className }: AtmosphereFXProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const steelRgb = hexToRgbTriplet(colorTokens.steel);
    const whiteRgb = hexToRgbTriplet(colorTokens.white);
    const accentRgb = hexToRgbTriplet(colorTokens.accent);

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
    const densityScale = reducedMotion ? 0.2 : isSmallViewport ? 0.5 : 1;
    const particleCount = Math.round(particleDensity * densityScale);

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.4,
      speed: Math.random() * 6 + 3,
      drift: (Math.random() - 0.5) * 4,
      alpha: Math.random() * 0.25 + 0.06,
    }));

    const smokeCount = reducedMotion ? 1 : 2;
    const smoke: SmokeBlob[] = Array.from({ length: smokeCount }, () => ({
      x: Math.random() * width,
      y: height * (0.4 + Math.random() * 0.6),
      r: Math.max(width, height) * (0.3 + Math.random() * 0.2),
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 1.2,
      alpha: 0.04 + Math.random() * 0.03,
    }));

    let scanPos = -0.3;
    let raf = 0;
    let lastTime = performance.now();
    let running = true;

    const draw = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (const blob of smoke) {
        if (!reducedMotion) {
          blob.x += blob.vx * dt;
          blob.y += blob.vy * dt;
          if (blob.x < -blob.r) blob.x = width + blob.r;
          if (blob.x > width + blob.r) blob.x = -blob.r;
        }
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
        gradient.addColorStop(0, `rgba(${steelRgb},${blob.alpha})`);
        gradient.addColorStop(1, `rgba(${steelRgb},0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

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

      if (!reducedMotion) {
        scanPos += dt * 0.05;
        if (scanPos > 1.3) scanPos = -0.3;
        const bandY = scanPos * height;
        const scanGradient = ctx.createLinearGradient(0, bandY - 60, 0, bandY + 60);
        scanGradient.addColorStop(0, `rgba(${accentRgb},0)`);
        scanGradient.addColorStop(0.5, `rgba(${accentRgb},0.035)`);
        scanGradient.addColorStop(1, `rgba(${accentRgb},0)`);
        ctx.fillStyle = scanGradient;
        ctx.fillRect(0, bandY - 60, width, 120);
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
  }, [particleDensity, reducedMotion]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
