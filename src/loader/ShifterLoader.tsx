import { useMemo, type CSSProperties } from "react";
import { mergeShifterLoaderConfig } from "./loaderConfig";
import { useLoaderTimeline } from "./useLoaderTimeline";
import { useReducedMotion } from "./useReducedMotion";
import { BackgroundFX } from "./BackgroundFX";
import { HUDFrame } from "./HUDFrame";
import type { LoaderPhase, ShifterLoaderProps } from "./types";
import "./ShifterLoader.css";

const PHASE_ORDER: LoaderPhase[] = [
  "boot",
  "identify",
  "impact",
  "connection",
  "ready",
  "exit",
];

function phaseAtLeast(phase: LoaderPhase, target: LoaderPhase): boolean {
  return PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf(target);
}

/** Announcement text for the aria-live region, kept short and non-redundant. */
function announcementFor(phase: LoaderPhase, readyLine: string, playerName: string): string {
  switch (phase) {
    case "boot":
      return "System boot in progress.";
    case "identify":
      return `Player identified: ${playerName}.`;
    case "impact":
      return playerName;
    case "connection":
      return "Streamer links loaded.";
    case "ready":
    case "exit":
      return readyLine;
    default:
      return "";
  }
}

/**
 * Full-screen cinematic loader for SHIFTER_PRO — Call of Duty inspired,
 * tactical HUD aesthetic. Pure React/CSS/Canvas (no video asset), driven by
 * a single phase timeline: boot -> identify -> impact -> connection -> ready -> exit.
 *
 * All content, palette, pacing and effect toggles come from `loaderConfig.ts`
 * and can be overridden per-instance via the `config` prop.
 */
export function ShifterLoader({ config, onComplete, fullscreen = true }: ShifterLoaderProps) {
  const merged = useMemo(() => mergeShifterLoaderConfig(config), [config]);
  const { texts, colors, timings, effects, glitchIntensity } = merged;
  const reducedMotion = useReducedMotion();

  const { phase } = useLoaderTimeline(timings, onComplete ?? (() => {}));

  const identified = phaseAtLeast(phase, "identify");
  const connected = phaseAtLeast(phase, "connection");
  const missionReady = phaseAtLeast(phase, "ready");
  const shakeEnabled = effects.cameraShake && !reducedMotion;

  const cssVars: CSSProperties = {
    "--color-bg-deep": colors.bgDeep,
    "--color-bg-base": colors.bgBase,
    "--color-steel": colors.steel,
    "--color-steel-light": colors.steelLight,
    "--color-white": colors.white,
    "--color-accent": colors.accent,
    "--duration-boot": `${timings.boot}ms`,
    "--duration-identify": `${timings.identify}ms`,
    "--duration-impact": `${timings.impact}ms`,
    "--duration-connection": `${timings.connection}ms`,
    "--duration-ready": `${timings.ready}ms`,
    "--duration-exit": `${timings.exit}ms`,
    "--glitch-intensity": glitchIntensity,
  } as CSSProperties;

  return (
    <div
      className="shifter-loader"
      data-phase={phase}
      data-fullscreen={fullscreen ? "true" : undefined}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      data-identified={identified ? "true" : undefined}
      data-connected={connected ? "true" : undefined}
      data-mission-ready={missionReady ? "true" : undefined}
      data-shake={shakeEnabled ? "true" : undefined}
      style={cssVars}
      role="status"
    >
      <span className="shifter-loader__sr-only" aria-live="polite">
        {announcementFor(phase, texts.readyLine, texts.playerName)}
      </span>

      <BackgroundFX
        colors={colors}
        effects={effects}
        phase={phase}
        particleDensity={merged.particleDensity}
        reducedMotion={reducedMotion}
      />

      {effects.vignette && <div className="shifter-loader__vignette" aria-hidden="true" />}
      {effects.noise && <div className="shifter-loader__noise" aria-hidden="true" />}

      <HUDFrame phase={phase} enabled={effects.hudReadouts} reducedMotion={reducedMotion} />

      <div className="shifter-loader__scene" aria-hidden="true">
        <div className="shifter-loader__boot">
          {texts.bootLines.map((line, index) => (
            <p
              key={line}
              className="shifter-loader__boot-line"
              style={{ "--line-index": index } as CSSProperties}
            >
              <span className="shifter-loader__boot-caret">&gt;</span> {line}
            </p>
          ))}
        </div>

        <div className="shifter-loader__identify-tag">PLAYER IDENTIFIED</div>

        <div className="shifter-loader__name-wrap">
          <span className="shifter-loader__name-base">{texts.playerName}</span>
          <span className="shifter-loader__name-highlight">{texts.playerName}</span>
          {effects.glitch && !reducedMotion && (
            <>
              <span className="shifter-loader__name-glitch shifter-loader__name-glitch--a" aria-hidden="true">
                {texts.playerName}
              </span>
              <span className="shifter-loader__name-glitch shifter-loader__name-glitch--b" aria-hidden="true">
                {texts.playerName}
              </span>
            </>
          )}
          {!reducedMotion && <span className="shifter-loader__scan-bar" />}
          <span className="shifter-loader__tagline">{texts.tagline}</span>
        </div>

        <div className="shifter-loader__connection">
          <div className="shifter-loader__tag shifter-loader__tag--twitch">{texts.twitchLine}</div>
          <div className="shifter-loader__tag shifter-loader__tag--discord">{texts.discordLine}</div>
        </div>

        <div className="shifter-loader__ready">{texts.readyLine}</div>
      </div>

      {effects.flash && !reducedMotion && <div className="shifter-loader__flash" aria-hidden="true" />}
      {effects.scanlines && <div className="shifter-loader__scanline-overlay" aria-hidden="true" />}
    </div>
  );
}
