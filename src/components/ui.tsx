import React from "react";
import { FileCode } from "lucide-react";
import { draftLabel, type DraftPhase } from "../system/product";
import { clamp, lerp, rng, seedOf } from "../system/anim";
import { useTheme } from "../system/theme";
import { ms } from "../system/timeline";
import { FONT, HAIRLINE, MONO_TRACKING, RF, TYPE } from "../system/tokens";
import { PAGES, PageView, type PageId } from "../pages";

/* ───────────────────────────── surfaces ───────────────────────────── */

export const Surface: React.FC<{
  w?: number;
  h?: number;
  radius?: number;
  shadow?: "sm" | "md" | "lg";
  sunken?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ w, h, radius = RF.lg, shadow = "sm", sunken, style, children }) => {
  const { c, shadow: sh } = useTheme();
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: sunken ? c.surfaceSunken : c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: sh(shadow, 1.6),
        boxSizing: "border-box",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────── text ─────────────────────────────── */

const GLYPHS = "abcdefghjkmnpqrstvwxyz0123456789<>/{}=;:.#";

/**
 * Scramble-decode (brief §5.3): left→right, each character cycles 3–5 mono
 * glyphs over 120 ms with a 25 ms stagger, then lands. Before its window a
 * character shows `before` (the code row, or the old name). Only ever used
 * when a URL is born: the mint and the rename.
 */
export function scramble(
  frame: number,
  start: number,
  target: string,
  before: string,
  seed: string,
): string {
  const r = rng(seedOf(seed));
  const flips = target.split("").map(() => 3 + Math.floor(r() * 3));
  const len = Math.max(target.length, before.length);
  let out = "";
  for (let i = 0; i < len; i++) {
    const s = start + i * ms(25);
    const local = frame - s;
    const finalCh = target[i] ?? "";
    if (local < 0) out += before[i] ?? "";
    else if (local >= ms(120)) out += finalCh;
    else if (!finalCh) out += "";
    else {
      const n = flips[i] ?? 4;
      const k = Math.floor((local / ms(120)) * n);
      out += GLYPHS[Math.floor(rng(seedOf(seed) + i * 31 + k)() * GLYPHS.length)];
    }
  }
  return out;
}

/** Frame a scramble of `len` characters has fully landed. */
export const scrambleDoneAt = (start: number, len: number) => start + (len - 1) * ms(25) + ms(120);

/**
 * Typewriter with a human rhythm: seeded per-key intervals of 40–90 ms,
 * stretched to fill exactly [start, end]. For prompts, terminal, JSON and URLs
 * only — never display type. Returns the visible prefix.
 */
export function typed(frame: number, start: number, end: number, text: string, seed = text): string {
  if (frame < start) return "";
  if (frame >= end) return text;
  const r = rng(seedOf(seed));
  const gaps = text.split("").map((ch) => (40 + r() * 50) * (ch === " " ? 1.4 : 1));
  const total = gaps.reduce((a, b) => a + b, 0);
  const k = (end - start) / total;
  let acc = start;
  for (let i = 0; i < text.length; i++) {
    acc += gaps[i]! * k;
    if (frame < acc) return text.slice(0, i);
  }
  return text;
}

/** Keystroke frames for a `typed()` run — the SFX cue list reads these. */
export function keystrokes(start: number, end: number, text: string, seed = text): number[] {
  const r = rng(seedOf(seed));
  const gaps = text.split("").map((ch) => (40 + r() * 50) * (ch === " " ? 1.4 : 1));
  const total = gaps.reduce((a, b) => a + b, 0);
  const k = (end - start) / total;
  let acc = start;
  return gaps.map((g) => (acc += g * k));
}

export const Caret: React.FC<{ frame: number; color: string; h: number; on?: boolean }> = ({
  frame,
  color,
  h,
  on,
}) => {
  // blinks on the beat: visible for the first half of each beat
  const visible = on ?? Math.floor(frame / 15) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: Math.max(3, h * 0.07),
        height: h,
        marginLeft: 4,
        verticalAlign: "middle",
        background: color,
        opacity: visible ? 1 : 0,
      }}
    />
  );
};

/* ────────────────────────────── pieces ────────────────────────────── */

export const CARD_W = 540;
export const CARD_H = 120;

/**
 * A downloaded page: Lucide `file-code` · filename · mono size, with a tiny
 * live thumbnail of the page — the first colour in the film, kept small.
 * `lift` 0→1 is a pick-up: shadow sm→lg, scale 1.04.
 */
export const FileCard: React.FC<{
  id: PageId;
  f: number;
  lift?: number;
  thumb?: boolean;
  frozen?: number;
  style?: React.CSSProperties;
}> = ({ id, f, lift = 0, thumb = true, frozen, style }) => {
  const { c, shadow } = useTheme();
  const page = PAGES[id];
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: RF.lg,
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: lift > 0.5 ? shadow("lg", 1.6) : shadow("sm", 1.6),
        transform: `scale(${lerp(1, 1.04, lift)})`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 22px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {thumb ? (
        <PageView id={id} f={frozen ?? f} width={128} radius={RF.sm} style={{ flex: "none" }} />
      ) : (
        <FileCode size={44} color={c.textSecondary} strokeWidth={1.6} />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {thumb ? <FileCode size={26} color={c.textSecondary} strokeWidth={1.8} /> : null}
          <span style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: TYPE.ui, color: c.text, whiteSpace: "nowrap" }}>
            {page.file}
          </span>
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontWeight: 500,
            fontSize: 20,
            letterSpacing: MONO_TRACKING,
            color: c.textMuted,
            marginTop: 6,
          }}
        >
          {page.kb} KB
        </div>
      </div>
    </div>
  );
};

/** The live dot, with its single pulse ring (scale 1→2.4, opacity .5→0, 700 ms). */
export const LiveDot: React.FC<{ size?: number; ignite?: number; ring?: number; color?: string }> = ({
  size = 16,
  ignite = 1,
  ring = 0,
  color,
}) => {
  const { c } = useTheme();
  const fill = color ?? c.live;
  return (
    <span style={{ position: "relative", width: size, height: size, flex: "none", display: "inline-block" }}>
      {ring > 0 && ring < 1 ? (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: fill,
            transform: `scale(${lerp(1, 2.4, ring)})`,
            opacity: lerp(0.5, 0, ring),
          }}
        />
      ) : null}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: ignite >= 1 ? fill : c.border,
          transform: `scale(${lerp(0.4, 1, clamp(ignite))})`,
        }}
      />
    </span>
  );
};

/** `{slug}.kept.host`: the slug is theirs (ink), the suffix is ours (muted). */
export const Host: React.FC<{ slug: string; suffix?: string; size: number; weight?: number }> = ({
  slug,
  suffix = ".kept.host",
  size,
  weight = 600,
}) => {
  const { c } = useTheme();
  return (
    <span style={{ fontFamily: FONT.display, fontWeight: weight, fontSize: size, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
      <span style={{ color: c.text }}>{slug}</span>
      <span style={{ color: c.textMuted }}>{suffix}</span>
    </span>
  );
};

/** shadcn button, kept-themed: accent fill (primary) or quiet surface (secondary). */
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: number;
  press?: number;
  hover?: number;
  style?: React.CSSProperties;
}> = ({ children, variant = "primary", size = TYPE.ui, press = 0, hover = 0, style }) => {
  const { c } = useTheme();
  const primary = variant === "primary";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.4,
        fontFamily: FONT.body,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1,
        padding: `${size * 0.62}px ${size * 0.95}px`,
        borderRadius: RF.md,
        background: primary ? (hover > 0.5 ? c.accentHover : c.accent) : c.surfaceSunken,
        color: primary ? c.onAccent : c.text,
        border: primary ? "none" : `${HAIRLINE}px solid ${c.border}`,
        transform: `scale(${1 - press * 0.02})`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Small mono chip, e.g. `NO KEY`. */
export const Chip: React.FC<{ children: React.ReactNode; tone?: "surface" | "sunken" | "accent"; size?: number; style?: React.CSSProperties }> = ({
  children,
  tone = "sunken",
  size = 20,
  style,
}) => {
  const { c } = useTheme();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: FONT.mono,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: MONO_TRACKING,
        textTransform: "uppercase",
        padding: `${size * 0.45}px ${size * 0.8}px`,
        borderRadius: RF.pill,
        background: tone === "accent" ? c.accentSoft : tone === "surface" ? c.surface : c.surfaceSunken,
        color: tone === "accent" ? c.accent : c.textSecondary,
        border: tone === "surface" ? `${HAIRLINE}px solid ${c.border}` : "none",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** The product's DraftChip (`components/kept/draft-chip.tsx`): label and dot from the code. */
export const DraftChip: React.FC<{ phase: DraftPhase; label?: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({
  phase,
  label,
  size = 20,
  style,
}) => {
  const { c, shadow } = useTheme();
  const dot = phase === "kept" ? c.accent : phase === "draft" ? c.warning : c.danger;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.5,
        fontFamily: FONT.mono,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: MONO_TRACKING,
        textTransform: "uppercase",
        padding: `${size * 0.4}px ${size * 0.75}px`,
        borderRadius: RF.pill,
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: shadow("sm", 1.6),
        color: c.textSecondary,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span style={{ width: size * 0.36, height: size * 0.36, borderRadius: "50%", background: dot }} />
      {label ?? draftLabel(phase)}
    </span>
  );
};
