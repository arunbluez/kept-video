import React from "react";
import { useCurrentFrame } from "remotion";
import { Check, Copy } from "lucide-react";
import { ORRERY_NAME, ORRERY_SLUG } from "../copy";
import { Cursor } from "../components/Cursor";
import { BAR_H, PageBadge } from "../components/Frame";
import { Opening } from "../components/Opening";
import { SuperAt } from "../components/SuperAt";
import { Mono } from "../components/Type";
import { Button, LiveDot, scramble } from "../components/ui";
import { typed } from "../system/typing";
import { TYPING } from "../system/cues";
import { PAGE_H } from "../pages/types";
import { PageView } from "../pages";
import { ORRERY_SOURCE } from "../pages/Orrery";
import { clamp, lerp, prog, rng, track } from "../system/anim";
import { draftLabel } from "../system/product";
import { useTheme } from "../system/theme";
import { at, beats, ms } from "../system/timeline";
import { EASE, FONT, HAIRLINE, RF, TYPE } from "../system/tokens";
import { REGION } from "../system/world";
import { A2_FRAME } from "./camera-path";
import { DESERVES } from "./Act1";
import { ORRERY_CARRY, orreryCardAt } from "./Pile";

/**
 * Act 2 — DROP (0:22–0:44). The signature: the drop tile behaves the way the
 * product's tile does (`kept-engine.ts`: idle "Drop your HTML" → dragover
 * "Release to keep it" → minting "Keeping it…" → live), a URL is born by
 * scramble-decode, and the link opens into the page it names.
 */

const TILE = { cx: 960, cy: 520, w: 720, h: 440 };
/** The card hovers over the tile's icon, so "Release to keep it" stays readable. */
const CARRY_DY = -96;
const PILL = { cx: 960, cy: 520 };
const FR = {
  x: A2_FRAME.cx - A2_FRAME.w / 2,
  y: A2_FRAME.cy - A2_FRAME.h / 2,
  w: A2_FRAME.w,
};
const PAGE_TOP = FR.y + BAR_H;
const HOST_FULL = `${ORRERY_SLUG}.kept.host`;

const T = {
  reveal: at(22.0),
  dragover: at(24.5),
  drop: at(25.0),
  collapse: at(26.0) - ms(100),
  mint: at(26.5),
  copy: at(27.25),
  open: at(31.0),
  dragFrom: at(32.0),
  dragTo: at(33.5),
  badgeIn: at(33.5),
  badgeClick: at(37.0),
  signInClick: at(37.5),
  keep: at(38.0),
  select: at(40.5),
  rename: at(41.0),
};

/* ───────────────────────── the glyph sand ───────────────────────── */

const SOURCE_CHARS = ORRERY_SOURCE.replace(/\s+/g, "");
const ROW = 24;
const GLYPHS = (() => {
  const r = rng(25);
  return Array.from({ length: ROW * 5 }, (_, i) => ({
    ch: SOURCE_CHARS[(i * 7) % SOURCE_CHARS.length]!,
    sx: (r() - 0.5) * 400,
    sy: (r() - 0.5) * 80 + CARRY_DY,
    delay: r() * ms(560),
    row: Math.floor(i / ROW),
    col: i % ROW,
  }));
})();
/** The settled row the link is decoded from. */
const ROW_TEXT = GLYPHS.slice(0, ROW)
  .map((g) => g.ch)
  .join("");
/** The collapsed row sits where the pill's host text will be. */
const ROW_DX = -73;

const GlyphSand: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  const collapse = prog(frame, T.collapse, ms(300), EASE.out);
  return (
    <>
      {GLYPHS.map((g, i) => {
        const p = clamp((frame - T.drop - g.delay) / ms(380));
        if (p <= 0) return null;
        const tx = -230 + g.col * 20;
        const ty = 120 - g.row * 30;
        // pour: ease-in on the fall (gravity), ease-out across
        let x = lerp(g.sx, tx, EASE.out(p));
        let y = lerp(g.sy, ty, p * p);
        let size = 20;
        let o = 1;
        if (collapse > 0) {
          x = lerp(x, ROW_DX - ((ROW - 1) * 22) / 2 + g.col * 22, collapse);
          y = lerp(y, 0, collapse);
          size = lerp(20, 26, collapse);
          if (g.row > 0) o = 1 - collapse;
        }
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
              fontFamily: FONT.mono,
              fontSize: size,
              color: g.row === 0 && collapse > 0 ? c.text : c.textSecondary,
              opacity: o,
            }}
          >
            {g.ch}
          </span>
        );
      })}
    </>
  );
};

/* ─────────────────────────────── tile ─────────────────────────────── */

const UploadIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  // the product tile's own glyph (KeptLanding.tsx, idle face)
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7}>
    <path d="M12 16V4M8 8l4-4 4 4" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);

const DropTile: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  // T1: the hairline that wipes "Your work deserves a link." away is the one
  // that reveals the tile — one line, one move (Type.tsx's exit wipe geometry).
  const wipe = prog(frame, T.reveal, beats(1), EASE.camera);
  const wipeX = DESERVES.cx - DESERVES.width / 2 + wipe * (DESERVES.width + 40) - 20;
  const reveal = clamp((wipeX - (TILE.cx - TILE.w / 2)) / TILE.w);
  if (reveal <= 0) return null;
  const over = prog(frame, T.dragover, ms(160));
  const dropped = frame >= T.drop;
  const settle = prog(frame, T.drop, ms(400), EASE.spring);
  const scale = dropped ? lerp(1.14, 1, settle) : lerp(1, 1.14, over);
  const squashY = dropped ? lerp(0.97, 1, settle) : 1;
  const minting = frame >= T.drop && frame < T.mint + ms(200);
  const fade = 1 - prog(frame, T.mint, ms(400));
  if (fade <= 0) return null;
  const elapsed = clamp((frame - T.drop) / (T.mint - T.drop));
  return (
    <div
      style={{
        position: "absolute",
        left: TILE.cx - TILE.w / 2,
        top: TILE.cy - TILE.h / 2,
        width: TILE.w,
        height: TILE.h,
        transform: `scale(${scale}, ${scale * squashY})`,
        clipPath: `inset(-20% ${(1 - reveal) * 100}% -20% -20%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: RF.xl,
          background: over > 0.5 && !dropped ? c.accentSoft : dropped ? c.accentSoft : c.surface,
          border: `3px ${over > 0.5 || dropped ? "solid" : "dashed"} ${c.accent}`,
          opacity: fade,
        }}
      />
      {!dropped ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <UploadIcon size={68} color={c.accent} />
          <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 36, color: c.text }}>
            {over > 0.5 ? "Release to keep it" : "Drop your HTML"}
          </div>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 22,
              color: c.accent,
              background: c.accentSoft,
              padding: "10px 20px",
              borderRadius: RF.pill,
            }}
          >
            yourpage.kept.host
          </span>
        </div>
      ) : null}
      {minting ? (
        <>
          <div style={{ position: "absolute", left: TILE.w / 2, top: TILE.h / 2 }}>
            <GlyphSand frame={frame} />
          </div>
          <Mono size={22} color={c.textSecondary} style={{ position: "absolute", right: 30, top: 26 }}>
            {(elapsed * 2.4).toFixed(1)} s
          </Mono>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 34,
              textAlign: "center",
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 30,
              color: c.text,
              opacity: 1 - prog(frame, T.collapse, ms(200)),
            }}
          >
            Keeping it…
          </div>
        </>
      ) : null}
    </div>
  );
};

/* ───────────────────────────── the link ───────────────────────────── */

/** The host as characters, slug in ink and suffix muted, for the scramble. */
const HostChars: React.FC<{ text: string; slugLen: number; size: number; font: string; selected?: number }> = ({
  text,
  slugLen,
  size,
  font,
  selected = 0,
}) => {
  const { c } = useTheme();
  return (
    <span style={{ fontFamily: font, fontWeight: font === FONT.display ? 600 : 500, fontSize: size, letterSpacing: font === FONT.display ? "-0.02em" : 0, whiteSpace: "pre" }}>
      <span
        style={{
          color: selected > 0.5 ? c.accent : c.text,
          background: selected > 0 ? c.accentSoft : "transparent",
          borderRadius: 4,
          opacity: 1,
        }}
      >
        {text.slice(0, slugLen)}
      </span>
      <span style={{ color: c.textMuted }}>{text.slice(slugLen)}</span>
    </span>
  );
};

const LinkPill: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  if (frame < T.mint || frame >= T.open + ms(240)) return null;
  const appear = prog(frame, T.mint, ms(300), EASE.spring);
  const ring = clamp((frame - T.mint) / ms(700));
  const copied = frame >= T.copy && frame < T.copy + ms(1600);
  const press = frame >= T.copy - ms(80) && frame < T.copy + ms(80) ? 1 : 0;
  const text = scramble(frame, T.mint, HOST_FULL, ROW_TEXT, "mint");
  const out = 1 - prog(frame, T.open, ms(200));
  return (
    <div
      style={{
        position: "absolute",
        left: PILL.cx,
        top: PILL.cy,
        transform: `translate(-50%, -50%) scale(${lerp(0.96, 1, appear)})`,
        display: "inline-flex",
        alignItems: "center",
        gap: 18,
        height: 100,
        padding: "0 18px 0 34px",
        borderRadius: RF.pill,
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: shadow("md", 1.6),
        opacity: out,
        whiteSpace: "nowrap",
      }}
    >
      <LiveDot size={18} ring={ring} />
      <HostChars text={text} slugLen={ORRERY_SLUG.length} size={44} font={FONT.display} />
      <Button press={press} size={24} style={{ minWidth: 168, marginLeft: 10, opacity: prog(frame, T.mint + ms(300), ms(240)) }}>
        {copied ? <Check size={24} strokeWidth={2.4} /> : <Copy size={24} strokeWidth={2} />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
};

/* ───────────────────────── frame, page, badge ───────────────────────── */

/** Cursor path once the page is open (region-local). */
const DRAG = { from: { x: 640, y: 640 }, to: { x: 1140, y: 600 } };

const SignInCrop: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  const open = prog(frame, T.badgeClick + ms(80), ms(240), EASE.spring);
  const close = prog(frame, T.signInClick + ms(160), ms(240), EASE.out);
  if (open <= 0 || close >= 1) return null;
  const press = frame >= T.signInClick - ms(80) && frame < T.signInClick + ms(80) ? 1 : 0;
  const email = typed(frame, TYPING.email.from, TYPING.email.to, TYPING.email.text);
  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        bottom: 150,
        width: 620,
        padding: 40,
        boxSizing: "border-box",
        borderRadius: RF.xl,
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: shadow("lg", 1.6),
        transform: `scale(${lerp(0.9, 1, open) * lerp(1, 0.6, close)})`,
        transformOrigin: "85% 110%",
        opacity: open * (1 - close),
      }}
    >
      {/* the real sign-in step: `/auth/keep` — heading and labels from sign-in-form.tsx */}
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", color: c.text }}>
        Keep this page
      </div>
      <div style={{ fontFamily: FONT.body, fontSize: 22, color: c.textMuted, margin: "26px 0 10px" }}>Email</div>
      <div
        style={{
          height: 66,
          borderRadius: RF.md,
          border: `${HAIRLINE}px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          fontFamily: FONT.body,
          fontSize: 26,
          color: email ? c.text : c.textMuted,
        }}
      >
        {email || "you@example.com"}
      </div>
      <Button press={press} size={26} style={{ width: "100%", marginTop: 20, boxSizing: "border-box" }}>
        Email me a magic link
      </Button>
    </div>
  );
};

const Badge: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  const slide = prog(frame, T.badgeIn, ms(400), EASE.out);
  if (slide <= 0) return null;
  const press = frame >= T.badgeClick - ms(80) && frame < T.badgeClick + ms(80) ? 1 : 0;
  const kept = frame >= T.keep;
  const pop = prog(frame, T.keep, ms(400), EASE.spring);
  const draftText = draftLabel("draft"); // "Draft · 7 days left"
  const [draftWord, countdown] = draftText.split(" · ") as [string, string];
  const keptText = draftLabel("kept"); // "Kept · permanent"
  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        bottom: 40,
        transform: `translateX(${(1 - slide) * 140}%) scale(${(1 - press * 0.02) * (kept ? lerp(1.08, 1, pop) : 1)})`,
        transformOrigin: "100% 50%",
      }}
    >
      <PageBadge size={30}>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: kept ? c.accent : c.warning,
            flex: "none",
          }}
        />
        {!kept ? (
          <span style={{ textTransform: "uppercase" }}>
            {draftWord} · {countdown} <span style={{ color: c.border }}>│</span>{" "}
            <span style={{ color: c.text }}>keep it forever →</span>
          </span>
        ) : (
          <span style={{ textTransform: "uppercase", position: "relative" }}>
            {/* the countdown breaks into characters that fall away, one by one */}
            {prog(frame, T.keep, ms(700)) < 1 ? (
              <span style={{ position: "absolute", left: 0, top: 0, whiteSpace: "pre" }}>
                {`${draftWord} · ${countdown}`.split("").map((ch, i) => {
                  const p = prog(frame, T.keep + i * ms(22), ms(320), EASE.camera);
                  return (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        transform: `translateY(${p * 60}px) rotate(${(i % 2 ? 1 : -1) * p * 24}deg)`,
                        opacity: 1 - p,
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            ) : null}
            <span
              style={{
                display: "inline-block",
                color: c.text,
                transform: `translateY(${(1 - prog(frame, T.keep + ms(300), ms(400), EASE.spring)) * -40}px)`,
                opacity: prog(frame, T.keep + ms(300), ms(240)),
              }}
            >
              {keptText}
            </span>
          </span>
        )}
      </PageBadge>
    </div>
  );
};

const OrreryFrame: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.open) return null;
  const spin =
    frame < T.dragFrom ? 0 : (track(frame, [{ f: T.dragFrom, v: 0 }, { f: T.dragTo, v: 1, ease: EASE.camera }], "v") * (DRAG.to.x - DRAG.from.x)) * 0.4;
  const selected = prog(frame, T.select, ms(120)) * (1 - prog(frame, T.rename + ms(600), ms(300)));
  const hostText = scramble(frame, T.rename, `${ORRERY_NAME}.kept.host`, HOST_FULL, "rename");
  const slugLen = frame >= T.rename + ms(25) * ORRERY_SLUG.length ? ORRERY_NAME.length : ORRERY_SLUG.length;
  return (
    <Opening
      frame={frame}
      openAt={T.open}
      pill={{ cx: PILL.cx, cy: PILL.cy, w: 700 }}
      frameRect={{ x: FR.x, y: FR.y, w: FR.w, pageH: PAGE_H }}
      host={
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LiveDot size={14} />
          <HostChars text={hostText} slugLen={slugLen} size={30} font={FONT.mono} selected={selected} />
        </span>
      }
    >
      <PageView id="orrery" f={frame} spin={spin} width={FR.w} />
      <Badge frame={frame} />
      <SignInCrop frame={frame} />
    </Opening>
  );
};

/* ───────────────────────────── cursor ───────────────────────────── */

const pageToLocal = (x: number, y: number) => ({ x: FR.x + x, y: PAGE_TOP + y });

function cursorAt(frame: number): { x: number; y: number; press: number; o: number } {
  const card = orreryCardAt(frame);
  const carry = { x: card.x - REGION.a1.x + 40, y: card.y - REGION.a1.y + 6 };
  const click = (t: number) => (frame >= t - ms(80) && frame < t + ms(80) ? 1 : 0);
  if (frame < ORRERY_CARRY.pick) {
    const p = prog(frame, at(22.5), ORRERY_CARRY.pick - at(22.5), EASE.camera);
    return { x: lerp(1480, carry.x, p), y: lerp(1160, carry.y, p), press: 0, o: 1 };
  }
  if (frame < T.drop) return { ...carry, press: 0.6, o: 1 };
  const copyBtn = { x: PILL.cx + 250, y: PILL.cy + 6 };
  if (frame < T.open) {
    const p = prog(frame, T.copy - ms(600), ms(500), EASE.camera);
    const drift = prog(frame, T.drop, ms(500));
    const rest = { x: lerp(carry.x, carry.x + 120, drift), y: lerp(carry.y, carry.y + 160, drift) };
    return { x: lerp(rest.x, copyBtn.x, p), y: lerp(rest.y, copyBtn.y, p), press: click(T.copy), o: 1 - prog(frame, T.open - ms(200), ms(200)) };
  }
  const dragA = pageToLocal(DRAG.from.x, DRAG.from.y);
  const dragB = pageToLocal(DRAG.to.x, DRAG.to.y);
  const badge = pageToLocal(1240, PAGE_H - 70);
  const button = pageToLocal(1240, PAGE_H - 210);
  const bar = { x: FR.x + 250, y: FR.y + 40 };
  const keys = [
    { f: T.open + ms(600), x: dragA.x + 40, y: dragA.y + 60 },
    { f: T.dragFrom, x: dragA.x, y: dragA.y },
    { f: T.dragTo, x: dragB.x, y: dragB.y, ease: EASE.camera },
    { f: T.badgeClick - ms(700), x: dragB.x + 20, y: dragB.y + 30 },
    { f: T.badgeClick, x: badge.x, y: badge.y, ease: EASE.camera },
    { f: T.signInClick, x: button.x, y: button.y, ease: EASE.camera },
    { f: T.keep + ms(400), x: button.x - 120, y: button.y + 150 },
    { f: T.select - ms(500), x: button.x - 160, y: button.y + 160 },
    { f: T.select, x: bar.x, y: bar.y, ease: EASE.camera },
    { f: T.rename + ms(800), x: bar.x + 60, y: bar.y + 90 },
  ];
  const dragging = frame >= T.dragFrom && frame < T.dragTo ? 0.7 : 0;
  return {
    x: track(frame, keys, "x"),
    y: track(frame, keys, "y"),
    press: Math.max(dragging, click(T.badgeClick), click(T.signInClick), click(T.select), click(T.select + ms(160))),
    o: prog(frame, T.open + ms(600), ms(240)),
  };
}

export const Act2World: React.FC = () => {
  const frame = useCurrentFrame();
  const cur = cursorAt(frame);
  return (
    <>
      <DropTile frame={frame} />
      <LinkPill frame={frame} />
      <OrreryFrame frame={frame} />
      {frame >= at(22.5) ? <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.o} /> : null}
    </>
  );
};

export const Act2Overlay: React.FC = () => (
  <>
    <SuperAt id="seconds" x={960} y={236} size={TYPE.displayL} width={1300} align="center" />
    <SuperAt id="noAccount" x={960} y={652} size={TYPE.displayL} width={1300} align="center" />
    <SuperAt id="draft" x={96} y={390} size={66} width={660} />
    <SuperAt id="forever" x={96} y={380} size={TYPE.displayL} width={660} />
    <SuperAt id="name" x={96} y={500} size={96} width={600} />
  </>
);
