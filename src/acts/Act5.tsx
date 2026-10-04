import React from "react";
import { useCurrentFrame } from "remotion";
import { AtSign, Globe, Link2, Mail, Rss } from "lucide-react";
import { WALL_HOST } from "../copy";
import { Cursor } from "../components/Cursor";
import { SuperAt } from "../components/SuperAt";
import { Mono } from "../components/Type";
import { PageView, type PageId } from "../pages";
import { arc, clamp, lerp, prog, track } from "../system/anim";
import { useTheme } from "../system/theme";
import { at, ms } from "../system/timeline";
import { EASE, FONT, HAIRLINE, RF, TYPE } from "../system/tokens";
import { PHONE, WALL } from "./geometry";

/**
 * Act 5 — WALL (1:26–1:48). Mira's wall: every page she has made, on one
 * kept page. Blocks land one per eighth note; the camera flies over the wall;
 * a block is dragged to a new cell; the frame folds into a phone.
 */

/* ───────────────────────────── geometry ───────────────────────────── */

const BAR = WALL.bar;

const CELL = { w: 400, h: 225, gap: 32 };
const GRID = { x: 52, y: 380 };

type Kind = { page: PageId } | { text: string } | { link: true };
interface Block {
  key: string;
  kind: Kind;
  col: number;
  row: number;
  w: number;
  h: number;
}

/** Fifteen blocks, landing in this order, one per eighth note from 1:27.0. */
const BLOCKS: Block[] = [
  { key: "orrery", kind: { page: "orrery" }, col: 0, row: 0, w: 2, h: 2 },
  { key: "synth", kind: { page: "synth" }, col: 2, row: 0, w: 1, h: 1 },
  { key: "text", kind: { text: "Small things, made with AI. A new one most weeks." }, col: 3, row: 0, w: 1, h: 1 },
  { key: "aquarium", kind: { page: "aquarium" }, col: 2, row: 1, w: 1, h: 1 },
  { key: "tiles", kind: { page: "tiles" }, col: 3, row: 1, w: 1, h: 1 },
  { key: "rhine", kind: { page: "rhine" }, col: 0, row: 2, w: 2, h: 1 },
  { key: "platformer", kind: { page: "platformer" }, col: 2, row: 2, w: 1, h: 1 },
  { key: "link", kind: { link: true }, col: 3, row: 2, w: 1, h: 1 },
  { key: "pomodoro", kind: { page: "pomodoro" }, col: 0, row: 3, w: 1, h: 1 },
  { key: "synthNight", kind: { page: "synthNight" }, col: 1, row: 3, w: 1, h: 1 },
  { key: "specimen", kind: { page: "specimen" }, col: 2, row: 3, w: 2, h: 1 },
  { key: "synthDrums", kind: { page: "synthDrums" }, col: 0, row: 4, w: 1, h: 1 },
  { key: "synthAcid", kind: { page: "synthAcid" }, col: 1, row: 4, w: 1, h: 1 },
  { key: "synthPastel", kind: { page: "synthPastel" }, col: 2, row: 4, w: 1, h: 1 },
  { key: "synthChords", kind: { page: "synthChords" }, col: 3, row: 4, w: 1, h: 1 },
];

const T = {
  header: at(86.0),
  firstLand: at(87.0),
  flyFrom: at(94.0),
  flyTo: at(98.0),
  pick: at(98.0),
  drop: at(99.0),
  phone: at(101.0),
  scroll: at(102.0),
};

/** The drag (1:38): the platformer is carried to the pomodoro's cell; they swap. */
const SWAP = { a: "platformer", b: "pomodoro" } as const;

const cellRect = (col: number, row: number, w: number, h: number) => ({
  x: GRID.x + col * (CELL.w + CELL.gap),
  y: BAR + GRID.y + row * (CELL.h + CELL.gap),
  w: w * CELL.w + (w - 1) * CELL.gap,
  h: h * CELL.h + (h - 1) * CELL.gap,
});

/** Phone-column rect for block i (phone-local), before scrolling. */
const phoneRect = (i: number) => {
  const w = PHONE.w - 44;
  const h = (w * 9) / 16;
  return { x: 22, y: 270 + i * (h + 16), w, h };
};

/* ───────────────────────────── blocks ───────────────────────────── */

const BlockFace: React.FC<{ b: Block; f: number; w: number; h: number }> = ({ b, f, w, h }) => {
  const { c } = useTheme();
  if ("page" in b.kind) {
    return (
      <div style={{ width: w, height: h, overflow: "hidden" }}>
        <PageView id={b.kind.page} f={f} width={w} style={{ minHeight: h }} />
      </div>
    );
  }
  const k = w / CELL.w;
  if ("text" in b.kind) {
    return (
      <div style={{ width: w, height: h, padding: 28 * k, boxSizing: "border-box", background: c.surface, fontFamily: FONT.display, fontWeight: 600, fontSize: 30 * k, lineHeight: 1.2, letterSpacing: "-0.02em", color: c.text }}>
        {b.kind.text}
      </div>
    );
  }
  return (
    <div style={{ width: w, height: h, padding: 28 * k, boxSizing: "border-box", background: c.surface, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Link2 size={40 * k} color={c.textSecondary} strokeWidth={1.8} />
      <div>
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 30 * k, color: c.text }}>Newsletter</div>
        <Mono size={18 * k}>Every Sunday →</Mono>
      </div>
    </div>
  );
};

function blockPose(i: number, frame: number) {
  const b = BLOCKS[i]!;
  let cell = cellRect(b.col, b.row, b.w, b.h);
  // the drag: A follows the cursor to B's cell; B slides into A's (FLIP, 400 ms)
  if (b.key === SWAP.a || b.key === SWAP.b) {
    const other = BLOCKS.find((x) => x.key === (b.key === SWAP.a ? SWAP.b : SWAP.a))!;
    const target = cellRect(other.col, other.row, other.w, other.h);
    const p = b.key === SWAP.a ? prog(frame, T.pick + ms(160), T.drop - T.pick - ms(160), EASE.camera) : prog(frame, T.drop, ms(400), EASE.out);
    const pt = b.key === SWAP.a ? arc(p, cell.x, cell.y, target.x, target.y, 120) : { x: lerp(cell.x, target.x, p), y: lerp(cell.y, target.y, p) };
    cell = { ...cell, x: pt.x, y: pt.y };
  }
  const land = T.firstLand + i * ms(250);
  const fly = prog(frame, land - ms(450), ms(450), EASE.out);
  // fly in from outside the wall, on a curve, rotating ±6° → 0°
  const cx = cell.x + cell.w / 2 - WALL.w / 2;
  const cy = cell.y + cell.h / 2 - (BAR + WALL.pageH) / 2;
  const len = Math.hypot(cx, cy) || 1;
  const sx = cell.x + (cx / len) * 1500;
  const sy = cell.y + (cy / len) * 1100 - 200;
  const pt = arc(fly, sx, sy, cell.x, cell.y, i % 2 ? 160 : -160);
  const rot = (1 - fly) * (i % 2 ? 6 : -6);
  const snap = prog(frame, land, ms(240), EASE.spring);
  const lifted = b.key === SWAP.a && frame >= T.pick && frame < T.drop + ms(200) ? 1 : 0;
  return { x: pt.x, y: pt.y, w: cell.w, h: cell.h, rot, s: (frame < land ? 1 : lerp(1.04, 1, snap)) * (1 + lifted * 0.04), o: clamp(fly * 4), lifted };
}

/* ───────────────────────────── the wall ───────────────────────────── */

const Header: React.FC<{ frame: number; phone: number }> = ({ frame, phone }) => {
  const { c } = useTheme();
  const rise = (d: number) => prog(frame, T.header + d, ms(400), EASE.out);
  const av = prog(frame, T.header, ms(400), EASE.spring);
  const L = (a: number, b: number) => lerp(a, b, phone);
  const icons = [Globe, Mail, AtSign, Rss];
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: L(100, 26),
          top: L(BAR + 100, 96),
          width: L(160, 92),
          height: L(160, 92),
          borderRadius: "50%",
          background: c.accentSoft,
          color: c.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: L(80, 46),
          transform: `scale(${av})`,
        }}
      >
        M
      </div>
      <div style={{ position: "absolute", left: L(300, 136), top: L(BAR + 104, 94), opacity: rise(ms(60)) }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: L(TYPE.h1, 40), letterSpacing: "-0.03em", color: c.text, lineHeight: 1 }}>Mira</div>
        <div style={{ fontFamily: FONT.body, fontSize: L(TYPE.bodyL, 20), color: c.textSecondary, marginTop: L(16, 8), whiteSpace: "nowrap" }}>
          I make small things with AI.
        </div>
        <div style={{ display: "flex", gap: L(22, 14), marginTop: L(20, 12), opacity: rise(ms(180)) }}>
          {icons.map((Icon, i) => (
            <Icon key={i} size={L(36, 22)} color={c.textSecondary} strokeWidth={1.8} />
          ))}
        </div>
      </div>
    </>
  );
};

const Wall: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  const phone = prog(frame, T.phone, ms(800), EASE.camera);
  const box = {
    x: lerp(WALL.x, PHONE.x, phone),
    y: lerp(WALL.y, PHONE.y, phone),
    w: lerp(WALL.w, PHONE.w, phone),
    h: lerp(BAR + WALL.pageH, PHONE.h, phone),
  };
  // the flyover: the wall plane tilts back (≤ 12°) while the camera travels
  const tilt = track(
    frame,
    [
      { f: T.flyFrom, v: 0 },
      { f: T.flyFrom + ms(1500), v: 10, ease: EASE.camera },
      { f: T.flyTo - ms(1000), v: 10 },
      { f: T.flyTo, v: 0, ease: EASE.camera },
    ],
    "v",
  );
  const scroll = Math.max(0, frame - T.scroll) * (120 / 60);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, perspective: 2400, perspectiveOrigin: `${WALL.x + WALL.w / 2}px ${WALL.y + 900}px` }}>
      <div
        style={{
          position: "absolute",
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          borderRadius: lerp(RF.lg, 64, phone),
          background: c.bg,
          border: `${lerp(HAIRLINE, 10, phone)}px solid ${phone > 0.5 ? c.text : c.border}`,
          boxShadow: shadow("md", 1.6),
          boxSizing: "border-box",
          transform: `rotateX(${tilt}deg)`,
          transformOrigin: "50% 40%",
          overflow: frame >= T.phone ? "hidden" : "visible",
        }}
      >
        {/* address bar → the phone's URL pill */}
        <div
          style={{
            position: "absolute",
            left: lerp(0, 60, phone),
            right: lerp(0, 60, phone),
            top: lerp(0, 22, phone),
            height: lerp(BAR, 46, phone),
            borderRadius: lerp(0, RF.pill, phone),
            borderTopLeftRadius: lerp(RF.lg, RF.pill, phone),
            borderTopRightRadius: lerp(RF.lg, RF.pill, phone),
            background: c.surfaceSunken,
            borderBottom: phone < 0.5 ? `${HAIRLINE}px solid ${c.border}` : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: phone > 0.5 ? "center" : "flex-start",
            gap: 24,
            padding: `0 ${lerp(28, 0, phone)}px`,
            boxSizing: "border-box",
            zIndex: 2,
          }}
        >
          <span style={{ display: "flex", gap: 10, opacity: 1 - phone }}>
            {phone < 0.5 ? [0, 1, 2].map((i) => <span key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c.border }} />) : null}
          </span>
          <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: lerp(30, 18, phone), color: c.textMuted }}>{WALL_HOST}</span>
        </div>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${-scroll}px)` }}>
          <Header frame={frame} phone={phone} />
          {BLOCKS.map((b, i) => {
            const g = blockPose(i, frame);
            if (g.o <= 0) return null;
            const pr = phoneRect(i);
            const x = lerp(g.x, pr.x, phone);
            const y = lerp(g.y, pr.y, phone);
            const w = lerp(g.w, pr.w, phone);
            const h = lerp(g.h, pr.h, phone);
            return (
              <div
                key={b.key}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: w,
                  height: h,
                  borderRadius: RF.lg,
                  overflow: "hidden",
                  border: `${HAIRLINE}px solid ${c.border}`,
                  boxShadow: shadow(g.lifted ? "lg" : "sm", 1.6),
                  transform: `rotate(${g.rot}deg) scale(${g.s})`,
                  opacity: g.o,
                  zIndex: g.lifted ? 5 : 1,
                }}
              >
                <BlockFace b={b} f={frame} w={w} h={h} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────── cursor ───────────────────────────── */

function cursorAt(frame: number) {
  const a = BLOCKS.find((b) => b.key === SWAP.a)!;
  const from = cellRect(a.col, a.row, a.w, a.h);
  const pose = blockPose(BLOCKS.indexOf(a), frame);
  const hold = { x: WALL.x + pose.x + from.w / 2, y: WALL.y + pose.y + from.h / 2 };
  const keys = [
    { f: T.pick - ms(900), x: WALL.x + 2100, y: WALL.y + 1700 },
    { f: T.pick, x: WALL.x + from.x + from.w / 2, y: WALL.y + from.y + from.h / 2, ease: EASE.camera },
  ];
  if (frame < T.pick) return { x: track(frame, keys, "x"), y: track(frame, keys, "y"), press: 0 };
  if (frame < T.drop) return { ...hold, press: 0.7 };
  const p = prog(frame, T.drop + ms(300), ms(700), EASE.camera);
  return { x: lerp(hold.x, hold.x + 600, p), y: lerp(hold.y, hold.y + 700, p), press: 0 };
}

export const Act5World: React.FC = () => {
  const frame = useCurrentFrame();
  const { c } = useTheme();
  const cur = cursorAt(frame);
  const cursorOn = frame >= T.pick - ms(900) && frame < T.drop + ms(1000);
  const dragLabel = prog(frame, T.pick - ms(300), ms(300)) * (1 - prog(frame, T.drop + ms(600), ms(300)));
  return (
    <>
      <Wall frame={frame} />
      {dragLabel > 0 ? (
        <div style={{ position: "absolute", left: WALL.x + WALL.w + 40, top: WALL.y + 20, opacity: dragLabel }}>
          <Mono size={40} color={c.textSecondary}>
            Drag to arrange
          </Mono>
        </div>
      ) : null}
      {cursorOn ? <Cursor x={cur.x} y={cur.y} press={cur.press} /> : null}
    </>
  );
};

export const Act5Overlay: React.FC = () => (
  <>
    <SuperAt id="wall" x={96} y={380} size={92} width={720} />
    <SuperAt id="oneLink" x={96} y={380} size={TYPE.displayL} width={900} />
  </>
);
