/**
 * TS-side mirror of the color tokens in tokens.css, for contexts that can't
 * read CSS custom properties directly (canvas 2D fillStyle strings). Keep
 * in sync with tokens.css by hand — same handful of values, two formats.
 */
export const colorTokens = {
  bgDeep: "#050607",
  bgBase: "#0c0f11",
  steel: "#5b6670",
  steelLight: "#a9b4bb",
  white: "#eef2f4",
  accent: "#c9ff3a",
  live: "#ff4d4d",
} as const;

/** "#rrggbb" -> "r, g, b" for use inside rgba() strings. */
export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
