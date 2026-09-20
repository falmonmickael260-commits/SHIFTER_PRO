import type { ShifterLoaderConfig } from "./types";

/**
 * Single source of truth for the loader's content, palette, pacing and
 * effect toggles. Override any slice via the `config` prop on
 * <ShifterLoader config={{ ... }} /> — overrides are shallow-merged per
 * top-level key (texts / colors / timings / effects).
 */
export const defaultShifterLoaderConfig: ShifterLoaderConfig = {
  texts: {
    playerName: "SHIFTER_PRO",
    tagline: "COD // STREAMER",
    twitchLine: "TWITCH // SHIFTER_PRO2",
    discordLine: "DISCORD // BKHWW.26",
    bootLines: [
      "SYSTEM BOOT",
      "INITIALIZING COMBAT INTERFACE",
      "CONNECTION ESTABLISHED",
    ],
    identifyLines: ["PLAYER IDENTIFIED"],
    readyLine: "MISSION READY",
  },

  colors: {
    bgDeep: "#050607",
    bgBase: "#0c0f11",
    steel: "#5b6670",
    steelLight: "#a9b4bb",
    white: "#eef2f4",
    accent: "#c9ff3a",
  },

  // Total default runtime: 900 + 1100 + 650 + 900 + 700 + 500 = 4750ms
  timings: {
    boot: 900,
    identify: 1100,
    impact: 650,
    connection: 900,
    ready: 700,
    exit: 500,
  },

  effects: {
    particles: true,
    smoke: true,
    scanlines: true,
    noise: true,
    glitch: true,
    flash: true,
    cameraShake: true,
    vignette: true,
    hudReadouts: true,
  },

  glitchIntensity: 0.6,
  particleDensity: 70,
};

/** Deep-ish merge for the four config slices; arrays/primitives are replaced wholesale. */
export function mergeShifterLoaderConfig(
  overrides?: Partial<ShifterLoaderConfig>,
): ShifterLoaderConfig {
  if (!overrides) return defaultShifterLoaderConfig;
  return {
    texts: { ...defaultShifterLoaderConfig.texts, ...overrides.texts },
    colors: { ...defaultShifterLoaderConfig.colors, ...overrides.colors },
    timings: { ...defaultShifterLoaderConfig.timings, ...overrides.timings },
    effects: { ...defaultShifterLoaderConfig.effects, ...overrides.effects },
    glitchIntensity:
      overrides.glitchIntensity ?? defaultShifterLoaderConfig.glitchIntensity,
    particleDensity:
      overrides.particleDensity ?? defaultShifterLoaderConfig.particleDensity,
  };
}
