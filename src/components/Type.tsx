import React from "react";
import { useCurrentFrame } from "remotion";
import { clamp, prog, rng, seedOf } from "../system/anim";
import { cameraAt, useCam } from "../system/camera";
import { useTheme } from "../system/theme";
import { beats, ms } from "../system/timeline";
import {
  DISPLAY_LEADING,
  DISPLAY_TRACKING,
  EASE,
  FONT,
  HAIRLINE,
  MONO_TRACKING,
  TYPE,
} from "../system/tokens";

/* ───────────────────────── hand-drawn underline ───────────────────────── */

/**
 * The accent word's underline (brief §4.3): one slightly irregular, tapered
 * stroke, ~6% of the font size, drawn left→right with stroke-dashoffset over
 * 700 ms ease-out. The taper is a filled shape revealed through a stroked mask,
 * because an SVG stroke cannot vary its width.
 */
export const Underline: React.FC<{ progress: number; color: string; seed: string }> = ({
  progress,
  color,
  seed,
}) => {
  const r = rng(seedOf(seed));
  // A tapered ribbon across a 100×10 box: thin start, full belly, thin tail,
  // with a little seeded wobble so it reads as drawn, not ruled.
  const pts = 9;
  const top: string[] = [];
  const bot: string[] = [];
  const mid: string[] = [];
  for (let i = 0; i <= pts; i++) {
    const u = i / pts;
    const x = -1 + u * 103;
    const wobble = (r() - 0.5) * 1.6 + Math.sin(u * Math.PI * 1.3) * -1.2;
    const y = 5.4 + wobble - u * 1.2;
    const half = 0.6 + Math.sin(Math.pow(u, 0.8) * Math.PI) * 2.6;
    top.push(`${x.toFixed(2)},${(y - half).toFixed(2)}`);
    bot.unshift(`${x.toFixed(2)},${(y + half).toFixed(2)}`);
    mid.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  const id = `ul-${seedOf(seed)}`;
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: "-0.02em",
        right: "-0.04em",
        bottom: "-0.06em",
        height: "0.14em",
        overflow: "visible",
      }}
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-5} y={-5} width={115} height={20}>
          <polyline
            points={mid.join(" ")}
            fill="none"
            stroke="white"
            strokeWidth={12}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - progress}
          />
        </mask>
      </defs>
      <polygon points={[...top, ...bot].join(" ")} fill={color} mask={`url(#${id})`} />
    </svg>
  );
};

/* ───────────────────────────── supers (T2) ───────────────────────────── */

export type Word = string | { t: string; accent?: boolean };
const wordText = (w: Word) => (typeof w === "string" ? w : w.t);
const isAccent = (w: Word) => typeof w !== "string" && !!w.accent;

export interface SuperProps {
  /** Frame the first word starts rising. */
  from: number;
  /** Frame the exit wipe starts. Omit to stay. */
  to?: number;
  /** Top-left (or top-centre when `align: center`) in screen px. */
  x: number;
  y: number;
  size: number;
  lines: Word[][];
  /** Block width for the exit wipe and centring. */
  width: number;
  weight?: number;
  align?: "left" | "center";
  /** A mono meta line under the super. */
  mono?: string;
  /** Frame the mono line appears (defaults to after the last word lands). */
  monoFrom?: number;
  /** Follow the camera from `from` on, as if pinned to the canvas. */
  attach?: boolean;
  exitDur?: number;
  /** Ink for the whole super, e.g. a super set on a dark page plane. */
  colorOverride?: string;
}

const WORD_STAGGER = ms(60);
const WORD_RISE = ms(400);

/**
 * A super (on-screen headline). Words rise 0.6em from behind a clip at their
 * baseline, 400 ms ease-out, 60 ms stagger (T2), and leave behind a hairline
 * wipe (T1). Never typewritten, never bounced.
 */
export const Super: React.FC<SuperProps> = ({
  from,
  to,
  x,
  y,
  size,
  lines,
  width,
  weight = 700,
  align = "left",
  mono,
  monoFrom,
  attach,
  exitDur = beats(1),
  colorOverride,
}) => {
  const frame = useCurrentFrame();
  const cam = useCam();
  const { c } = useTheme();
  if (frame < from - 1) return null;
  if (to !== undefined && frame > to + exitDur + 1) return null;

  let wordIndex = 0;
  const wordCount = lines.reduce((n, l) => n + l.length, 0);
  const monoAt = monoFrom ?? from + wordCount * WORD_STAGGER + WORD_RISE;

  // T1: the hairline crosses left→right; what it has passed is gone.
  const exitP = to === undefined ? 0 : prog(frame, to, exitDur, EASE.camera);
  const wipeX = exitP * (width + 40) - 20;

  let transform = "";
  if (attach) {
    const c0 = cameraAt(from);
    const k = cam.s / c0.s;
    transform = `translate(${960 - x}px, ${540 - y}px) translate(${(c0.x - cam.x) * cam.s}px, ${(c0.y - cam.y) * cam.s}px) scale(${k}) translate(${x - 960}px, ${y - 540}px)`;
  }

  const left = align === "center" ? x - width / 2 : x;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: y,
        width,
        transform: transform || undefined,
        transformOrigin: "0 0",
      }}
    >
      <div
        style={{
          clipPath: exitP > 0 ? `inset(-40% 0 -40% ${Math.max(0, wipeX)}px)` : undefined,
          textAlign: align,
        }}
      >
        {lines.map((line, li) => (
          <div
            key={li}
            style={{
              overflow: "hidden",
              // room for descenders and the underline inside the clip
              paddingBottom: "0.16em",
              marginBottom: "-0.16em",
              paddingTop: "0.04em",
              fontFamily: FONT.display,
              fontWeight: weight,
              fontSize: size,
              lineHeight: DISPLAY_LEADING,
              letterSpacing: DISPLAY_TRACKING,
              color: colorOverride ?? c.text,
              whiteSpace: "nowrap",
            }}
          >
            {line.map((w, wi) => {
              const i = wordIndex++;
              const start = from + i * WORD_STAGGER;
              const p = prog(frame, start, WORD_RISE, EASE.out);
              const accent = isAccent(w);
              const ul = accent ? prog(frame, start + WORD_RISE + ms(200), ms(700), EASE.out) : 0;
              return (
                <React.Fragment key={wi}>
                  <span
                    style={{
                      display: "inline-block",
                      position: "relative",
                      transform: `translateY(${(1 - p) * 0.6}em)`,
                      opacity: clamp(p * 1.6),
                      color: accent ? c.accent : undefined,
                    }}
                  >
                    {wordText(w)}
                    {accent && ul > 0 ? (
                      <Underline progress={ul} color={c.accent} seed={wordText(w)} />
                    ) : null}
                  </span>
                  {wi < line.length - 1 ? " " : null}
                </React.Fragment>
              );
            })}
          </div>
        ))}
        {mono ? (
          <div
            style={{
              marginTop: size * 0.32,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontFamily: FONT.mono,
                fontWeight: 500,
                fontSize: TYPE.mono,
                letterSpacing: MONO_TRACKING,
                textTransform: "uppercase",
                color: c.textMuted,
                transform: `translateY(${(1 - prog(frame, monoAt, WORD_RISE)) * 100}%)`,
                opacity: prog(frame, monoAt, WORD_RISE),
              }}
            >
              {mono}
            </div>
          </div>
        ) : null}
      </div>
      {exitP > 0 && exitP < 1 ? (
        <div
          style={{
            position: "absolute",
            left: wipeX,
            top: -size * 0.15,
            bottom: -size * 0.15,
            width: HAIRLINE,
            background: c.border,
            opacity: 1 - prog(frame, to! + exitDur * 0.8, exitDur * 0.2),
          }}
        />
      ) : null}
    </div>
  );
};

/** Mono meta label: uppercase, +0.08em tracking (brief §4.3). */
export const Mono: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  upper?: boolean;
}> = ({ children, size = TYPE.mono, color, style, upper = true }) => {
  const { c } = useTheme();
  return (
    <span
      style={{
        fontFamily: FONT.mono,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: upper ? MONO_TRACKING : 0,
        textTransform: upper ? "uppercase" : "none",
        color: color ?? c.textMuted,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};
