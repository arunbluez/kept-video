import React from "react";
import { useCurrentFrame } from "remotion";
import { ShieldCheck } from "lucide-react";
import { HOST, LAPSED_SLUG, ORRERY_NAME } from "../copy";
import { BrowserFrame, Wordmark } from "../components/Frame";
import { Mascot } from "../components/Mascot";
import { SuperAt } from "../components/SuperAt";
import { Mono } from "../components/Type";
import { DraftChip, LiveDot } from "../components/ui";
import { PageView } from "../pages";
import { clamp, lerp, prog } from "../system/anim";
import { sixteenthAt } from "../system/music";
import { DRAFT_GRACE_DAYS, DRAFT_TTL_DAYS } from "../system/product";
import { useTheme } from "../system/theme";
import { at, beats, ms } from "../system/timeline";
import { EASE, FONT, HAIRLINE, MONO_TRACKING, RF, TYPE } from "../system/tokens";

/**
 * Act 6 — OPEN (1:48–2:12), the breakdown. A draft nobody kept (the edge's
 * real "wasn't kept" page, mascot dimmed), the canvas turning dark, a kept
 * page still live as the years roll, the forever promise, and the open books.
 */

const T = {
  lapsedOut: at(112.0),
  keptIn: at(113.0),
  years: at(116.0),
  promise: at(118.0),
  promiseOut: at(122.5),
  open: at(123.0),
  openOut: at(130.5),
};

const FR = { x: 760, y: 100, w: 1080, pageH: 800 };

/** The edge's bob: ±3% over 3 s, alternating — CSS ease-in-out, from globals.css. */
const bob = (t: number) => {
  const u = (t / 3) % 2;
  const tri = u < 1 ? u : 2 - u;
  const e = tri < 0.5 ? 2 * tri * tri : 1 - Math.pow(-2 * tri + 2, 2) / 2;
  return -3 + 6 * e;
};

/**
 * `apps/edge/src/system-pages.ts` → `expiredBody()`: the copy, the layout and
 * the mascot's `dim` mood, at film scale. Its tokens follow the canvas, as the
 * real page follows the visitor's colour scheme.
 */
const ExpiredPage: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  const t = frame / 60;
  return (
    <div style={{ width: FR.w, height: FR.pageH, background: c.bg, fontFamily: FONT.body, color: c.text }}>
      <div style={{ height: 84, borderBottom: `${HAIRLINE}px solid ${c.border}`, display: "flex", alignItems: "center", padding: "0 44px" }}>
        <Wordmark size={32} />
      </div>
      <div style={{ width: 760, margin: "0 auto", textAlign: "center", paddingTop: 34 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, transform: `translateY(${bob(t)}%)` }}>
          {/* the edge freezes the character at its rest instant: no breath, no blink */}
          <Mascot t={0} size={170} dim id="mascot-expired" />
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase", color: c.textSecondary, marginBottom: 16 }}>
          Draft · not kept
        </div>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 60, letterSpacing: "-0.03em", lineHeight: 1.04, marginBottom: 18 }}>
          This draft wasn&rsquo;t kept.
        </div>
        <div style={{ fontSize: 22, lineHeight: 1.55, color: c.textSecondary, margin: "0 auto 28px", maxWidth: "46ch" }}>
          Every page starts as a draft that stays online for {DRAFT_TTL_DAYS} days. That window passed without anyone keeping this one, so it
          stopped serving. <b style={{ color: c.text, fontWeight: 600 }}>It is not gone.</b>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            textAlign: "left",
            background: c.surface,
            border: `${HAIRLINE}px solid ${c.border}`,
            borderRadius: RF.lg,
            padding: 24,
            marginBottom: 28,
          }}
        >
          <div style={{ flex: "none", width: 56, height: 56, borderRadius: RF.sm, background: c.surfaceSunken, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={26} color={c.accent} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 20 }}>Recoverable for {DRAFT_GRACE_DAYS} days</div>
            <div style={{ fontSize: 18, color: c.textSecondary, marginTop: 3, lineHeight: 1.45 }}>
              Keep it and it comes back online, permanently. After {DRAFT_GRACE_DAYS} days it is deleted for good.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 21, padding: "19px 30px", borderRadius: RF.md, background: c.accent, color: c.onAccent }}>Keep this page →</span>
          <span style={{ fontWeight: 600, fontSize: 21, padding: "19px 30px", borderRadius: RF.md, background: c.surface, color: c.text, border: `${HAIRLINE}px solid ${c.border}` }}>
            Publish a new page →
          </span>
        </div>
      </div>
    </div>
  );
};

const Lapsed: React.FC<{ frame: number }> = ({ frame }) => {
  const out = prog(frame, T.lapsedOut, ms(900), EASE.camera);
  if (out >= 1) return null;
  // already in place when whip #3 lands on it
  return (
    <div style={{ position: "absolute", left: FR.x, top: FR.y, opacity: 1 - out, transform: `scale(${lerp(1, 0.94, out)})` }}>
      <BrowserFrame w={FR.w} pageH={FR.pageH} host={`${LAPSED_SLUG}.${HOST}`}>
        <ExpiredPage frame={frame} />
      </BrowserFrame>
    </div>
  );
};

/* ───────────────────────── the page that stays ───────────────────────── */

const Kept: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  const appear = prog(frame, T.keptIn, ms(700), EASE.out);
  const out = prog(frame, T.promiseOut, ms(500), EASE.camera);
  if (appear <= 0 || out >= 1) return null;
  // at the promise it steps up and back to make room for the quote
  const step = prog(frame, T.promise, ms(700), EASE.camera);
  const k = lerp(1, 0.62, step);
  const pageH = (FR.w * 9) / 16;
  const year = 2026 + Math.round(20 * Math.pow(prog(frame, T.years, beats(4), EASE.linear), 2));
  const pulse = clamp(((frame - T.keptIn) % beats(4)) / ms(700));
  return (
    <div
      style={{
        position: "absolute",
        left: FR.x,
        top: lerp(170, 60, step) + (1 - appear) * 40,
        opacity: appear * (1 - out),
        transform: `scale(${k})`,
        transformOrigin: "50% 0",
      }}
    >
      <BrowserFrame
        w={FR.w}
        pageH={pageH}
        host={
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LiveDot size={12} ring={pulse} />
            {`${ORRERY_NAME}.${HOST}`}
          </span>
        }
      >
        <PageView id="orrery" f={frame} width={FR.w} />
      </BrowserFrame>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
        <DraftChip phase="kept" size={24} />
        {frame >= T.years ? (
          <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 30, letterSpacing: MONO_TRACKING, color: c.textSecondary, fontVariantNumeric: "tabular-nums" }}>
            STILL LIVE · {year}
          </span>
        ) : null}
      </div>
    </div>
  );
};

const PROMISE_QUOTE =
  "…we announce the sunset well ahead of it, keep every kept page serving through that window, and publish an export so you can take your pages and their links elsewhere.";

/** `/promise` — the short version, quoted word for word from the page. */
const PromiseQuote: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  const on = prog(frame, T.promise + ms(400), ms(500), EASE.out);
  const out = prog(frame, T.promiseOut, ms(500), EASE.camera);
  if (on <= 0 || out >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: FR.x,
        top: 560 + (1 - on) * 30,
        width: FR.w,
        padding: "34px 40px",
        boxSizing: "border-box",
        borderRadius: RF.xl,
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: shadow("md", 1.6),
        opacity: on * (1 - out),
      }}
    >
      <Mono size={22} color={c.textSecondary}>
        If kept ever winds down
      </Mono>
      <div style={{ fontFamily: FONT.body, fontSize: 31, lineHeight: 1.45, color: c.text, marginTop: 16 }}>{PROMISE_QUOTE}</div>
      <div style={{ marginTop: 18 }}>
        <Mono size={20}>{`${HOST}/promise`}</Mono>
      </div>
    </div>
  );
};

/* ───────────────────────────── open books ───────────────────────────── */

const DOT_COLS = 24;
const DOT_ROWS = 7;

/** The landing's open-books dot field: every lit dot a kept page; the hollow one the next. */
const DotField: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  // lights on the soundtrack's 16ths, a few at a time
  const steps = Math.max(0, Math.floor(((frame - T.open - ms(400)) / beats(1)) * 4));
  const lit = Math.min(DOT_COLS * DOT_ROWS - 1, 40 + steps * 3);
  const breathe = 0.6 + 0.4 * Math.sin((frame / 60) * Math.PI * (2 / 2.4));
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${DOT_COLS}, 1fr)`, gap: 16 }}>
      {Array.from({ length: DOT_COLS * DOT_ROWS }, (_, i) => {
        const on = i < lit;
        const next = i === lit;
        return (
          <span
            key={i}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              boxSizing: "border-box",
              background: on ? c.accent : "transparent",
              border: on ? "none" : `${next ? 3 : HAIRLINE}px solid ${next ? c.accent : c.border}`,
              opacity: next ? breathe : 1,
              transform: on && i >= lit - 3 && sixteenthAt(frame) % 4 === 0 ? "scale(1.15)" : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

/** The landing's three reasons (`KeptLanding.tsx`, "why" section), label and heading verbatim. */
const WHY = [
  { label: "Permanent by default", title: "No expiry, ever" },
  { label: "Open source · AGPL", title: "Nothing to lock you in" },
  { label: "Costs in public", title: "Math you can check" },
];

const OpenBooks: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  const on = prog(frame, T.open, ms(500), EASE.out);
  const out = prog(frame, T.openOut, ms(500), EASE.camera);
  if (on <= 0 || out >= 1) return null;
  return (
    <div style={{ position: "absolute", left: FR.x, top: 130 - out * 40, width: FR.w, opacity: 1 - out }}>
      <div
        style={{
          padding: "40px 46px",
          borderRadius: RF.xl,
          background: c.surface,
          border: `${HAIRLINE}px solid ${c.border}`,
          boxShadow: shadow("md", 1.6),
          opacity: on,
          transform: `translateY(${(1 - on) * 30}px)`,
        }}
      >
        <DotField frame={frame} />
        <div style={{ fontFamily: FONT.body, fontSize: 26, color: c.textSecondary, marginTop: 30 }}>Every dot is a page kept online right now.</div>
      </div>
      <div style={{ display: "flex", gap: 30, marginTop: 30 }}>
        {WHY.map((w, i) => {
          const p = prog(frame, at(124.0) + beats(i), ms(400), EASE.out);
          return (
            <div
              key={w.label}
              style={{
                flex: 1,
                padding: "30px 30px 34px",
                borderRadius: RF.lg,
                background: c.surface,
                border: `${HAIRLINE}px solid ${c.border}`,
                opacity: p,
                transform: `translateY(${(1 - p) * 24}px)`,
              }}
            >
              <Mono size={18} color={c.textSecondary}>
                {w.label}
              </Mono>
              <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 34, letterSpacing: "-0.02em", color: c.text, marginTop: 12, lineHeight: 1.1 }}>
                {w.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Act6World: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Lapsed frame={frame} />
      <Kept frame={frame} />
      <PromiseQuote frame={frame} />
      <OpenBooks frame={frame} />
    </>
  );
};

export const Act6Overlay: React.FC = () => (
  <>
    <SuperAt id="week" x={96} y={380} size={84} width={620} />
    <SuperAt id="stays" x={96} y={400} size={TYPE.displayL * 0.8} width={620} />
    <SuperAt id="outlast" x={96} y={400} size={TYPE.displayL * 0.8} width={620} />
    <SuperAt id="open" x={96} y={400} size={TYPE.displayL * 0.8} width={620} />
  </>
);
