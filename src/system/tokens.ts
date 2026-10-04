import { Easing } from "remotion";

/**
 * kept design tokens, mirrored from `kept/apps/web/app/globals.css` — the
 * product's single source of truth. This is the ONLY file outside
 * `src/pages/` allowed to hold a hex value (brief §4.2). Everything kept owns
 * in the film reads its colour from here, through `useTokens()`.
 */

export const LIGHT = {
  bg: "#FAF8F4",
  surface: "#FFFFFF",
  surfaceSunken: "#F2EFE9",
  text: "#1A1714",
  textSecondary: "#6B645C",
  textMuted: "#9B948B",
  border: "#E5E0D8",
  accent: "#6D4AFF",
  accentHover: "#5B38F0",
  accentSoft: "#EDE9FF",
  live: "#3FB950",
  warning: "#E0A33A",
  danger: "#E5484D",
  /** shadcn `--color-primary-foreground`: the ink on an accent fill. */
  onAccent: "#FFFFFF",
} as const;

export type Palette = { -readonly [K in keyof typeof LIGHT]: string };

/**
 * The `[data-theme="dark"]` block. `--warning` / `--danger` have no dark
 * override in the product and are never used in the dark passage; they carry
 * the light values so the type stays total. `onAccent` follows the edge
 * system pages, which flip it to dark `--bg` to keep 5.2:1 on the lifted violet.
 */
export const DARK: Palette = {
  bg: "#131210",
  surface: "#1E1B17",
  surfaceSunken: "#0E0D0B",
  text: "#F5F1EA",
  textSecondary: "#A8A096",
  textMuted: "#6E6760",
  border: "#2A2620",
  accent: "#8B6DFF",
  accentHover: "#9D83FF",
  accentSoft: "#221B3A",
  live: "#3FB950",
  warning: "#E0A33A",
  danger: "#E5484D",
  onAccent: "#131210",
};

/** Warm shadows, never grey. Light and dark ramps from globals.css. */
export const SHADOW = {
  light: {
    sm: [0, 1, 2, "rgba(40,30,20,0.05)"],
    md: [0, 4, 16, "rgba(40,30,20,0.08)"],
    lg: [0, 12, 40, "rgba(40,30,20,0.12)"],
    mascot: [0, 6, 14, "rgba(40,30,20,0.18)"],
  },
  dark: {
    sm: [0, 1, 2, "rgba(0,0,0,0.3)"],
    md: [0, 4, 16, "rgba(0,0,0,0.4)"],
    lg: [0, 12, 40, "rgba(0,0,0,0.5)"],
    mascot: [0, 6, 14, "rgba(0,0,0,0.75)"],
  },
} as const;

export type ShadowName = keyof typeof SHADOW.light;

/** Radii. Mock screens drawn at film scale use `RF` (×1.5, brief §4.4). */
export const R = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;
export const RF = { sm: 12, md: 18, lg: 24, xl: 36, pill: 999 } as const;

/** Film hairline: a 1px UI hairline at the ~1.75× film scale. */
export const HAIRLINE = 2;

/** Motion durations in ms (brief §4.5). */
export const DUR = {
  instant: 80,
  fast: 160,
  base: 240,
  slow: 400,
  deliberate: 700,
  ambient: 6000,
} as const;

/**
 * Easings. `out` and `spring` are the product's `--ease-out` / `--ease-spring`.
 * `camera` is a film-only extension (logged in REVIEW.md): a camera starting
 * from rest needs an ease-in, which `--ease-out` does not have.
 */
export const EASE = {
  out: Easing.bezier(0.2, 0, 0, 1),
  spring: Easing.bezier(0.34, 1.56, 0.64, 1),
  camera: Easing.bezier(0.65, 0, 0.35, 1),
  linear: (t: number) => t,
} as const;

/**
 * Faces, as the product actually ships them (`lib/fonts.ts`): Geist display,
 * Inter body, JetBrains Mono meta. The brief named Hanken Grotesk / Geist —
 * the code wins (REVIEW.md).
 */
export const FONT = {
  display: "Geist, system-ui, sans-serif",
  body: "Inter, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

/** Film type scale at 1080p (brief §4.3). */
export const TYPE = {
  displayXL: 200,
  displayL: 120,
  h1: 72,
  h2: 48,
  bodyL: 36,
  ui: 28,
  mono: 23,
  hud: 20,
} as const;

/** Display setting: tracking −0.03em, leading 0.95. */
export const DISPLAY_TRACKING = "-0.03em";
export const DISPLAY_LEADING = 0.95;
/** Meta setting: uppercase mono, tracking +0.08em. */
export const MONO_TRACKING = "0.08em";
