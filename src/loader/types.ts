export type LoaderPhase =
  | "boot"
  | "identify"
  | "impact"
  | "connection"
  | "ready"
  | "exit";

export interface ShifterLoaderColors {
  /** Deepest background, almost pure black */
  bgDeep: string;
  /** Base background gradient stop */
  bgBase: string;
  /** Metallic steel gray used for frames / secondary text */
  steel: string;
  /** Lighter steel used for readouts */
  steelLight: string;
  /** Primary text / HUD white */
  white: string;
  /** Sparingly used accent color (impact flash, key highlights) */
  accent: string;
}

export interface ShifterLoaderTimings {
  /** ms spent on the BOOT phase */
  boot: number;
  /** ms spent on the IDENTIFY / scan phase */
  identify: number;
  /** ms spent on the IMPACT phase (flash + glitch) */
  impact: number;
  /** ms spent revealing TWITCH / DISCORD handles */
  connection: number;
  /** ms spent on the READY phase before exit */
  ready: number;
  /** ms spent on the exit transition (fade/scale out) */
  exit: number;
}

export interface ShifterLoaderTexts {
  playerName: string;
  tagline: string;
  twitchLine: string;
  discordLine: string;
  bootLines: string[];
  identifyLines: string[];
  readyLine: string;
}

export interface ShifterLoaderEffects {
  particles: boolean;
  smoke: boolean;
  scanlines: boolean;
  noise: boolean;
  glitch: boolean;
  flash: boolean;
  cameraShake: boolean;
  vignette: boolean;
  hudReadouts: boolean;
}

export interface ShifterLoaderConfig {
  texts: ShifterLoaderTexts;
  colors: ShifterLoaderColors;
  timings: ShifterLoaderTimings;
  effects: ShifterLoaderEffects;
  /** 0 (off) to 1 (max) intensity multiplier for the impact glitch */
  glitchIntensity: number;
  /** Base particle count at a 1440px-wide viewport; auto-scaled otherwise */
  particleDensity: number;
}

export interface ShifterLoaderProps {
  /** Partial config overrides merged onto the defaults */
  config?: Partial<ShifterLoaderConfig>;
  /** Called once the exit transition has fully finished */
  onComplete?: () => void;
  /** Force a fixed, full-viewport overlay (default true) */
  fullscreen?: boolean;
}
