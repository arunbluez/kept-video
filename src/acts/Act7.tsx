import React from "react";
import { useCurrentFrame } from "remotion";
import { HOST } from "../copy";
import { Cursor } from "../components/Cursor";
import { Mascot, smoothedGaze } from "../components/Mascot";
import { SuperAt } from "../components/SuperAt";
import { Mono } from "../components/Type";
import { PageView, type PageId } from "../pages";
import { clamp, lerp, prog, track } from "../system/anim";
import { useTheme } from "../system/theme";
import { at, beats, ms } from "../system/timeline";
import { EASE, HAIRLINE, RF, TYPE } from "../system/tokens";
import { FINALE } from "./geometry";

/**
 * Act 7 — KEPT (2:12–2:30). Everything the film made lands on one grid; the
 * mascot — last seen dimmed on a draft nobody kept — rises alive in the
 * middle of it, and watches the cursor leave.
 */

const T = {
  lift: at(132.0),
  rise: at(136.0),
  cursorIn: at(137.0),
  recede: at(139.0),
  url: at(143.0),
  leave: at(144.5),
};

/** 6 × 4 cells with the middle 2 × 2 left open for the mascot. */
const COLS = 6;
const ROWS = 4;
const CW = 360;
const CH = (CW * 9) / 16;
const GAP = 36;
const GRID_W = COLS * CW + (COLS - 1) * GAP;
const GRID_H = ROWS * CH + (ROWS - 1) * GAP;

const PAGE_CYCLE: PageId[] = [
  "orrery", "synth", "rhine", "aquarium", "platformer", "synthNight", "tiles", "pomodoro", "synthAcid", "specimen",
  "synthDrums", "synthPastel", "synthChords", "synth", "aquarium", "orrery", "platformer", "rhine", "tiles", "synthNight",
];

const CELLS = (() => {
  const out: { col: number; row: number }[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if ((col === 2 || col === 3) && (row === 1 || row === 2)) continue;
      out.push({ col, row });
    }
  }
  // land from the outside in, so the centre is the last thing to settle
  return out
    .map((c) => ({ ...c, d: Math.hypot(c.col + 0.5 - COLS / 2, c.row + 0.5 - ROWS / 2) }))
    .sort((a, b) => b.d - a.d);
})();

const cellCentre = (col: number, row: number) => ({
  x: FINALE.cx - GRID_W / 2 + col * (CW + GAP) + CW / 2,
  y: FINALE.cy - GRID_H / 2 + row * (CH + GAP) + CH / 2,
});

const Grid: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  // the plane tilts back as the camera pulls away, and settles flat (≤ 12°)
  const tilt = lerp(10, 0, prog(frame, T.lift, ms(3500), EASE.camera));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, perspective: 2400, perspectiveOrigin: `${FINALE.cx}px ${FINALE.cy}px` }}>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `rotateX(${tilt}deg)`, transformOrigin: `${FINALE.cx}px ${FINALE.cy}px` }}>
        {CELLS.map((cell, i) => {
          // one per sixteenth: the final lift
          const land = T.lift + Math.round(i * beats(0.25));
          const fly = prog(frame, land - ms(420), ms(420), EASE.out);
          if (fly <= 0) return null;
          const end = cellCentre(cell.col, cell.row);
          const dx = end.x - FINALE.cx;
          const dy = end.y - FINALE.cy;
          const len = Math.hypot(dx, dy) || 1;
          const snap = prog(frame, land, ms(240), EASE.spring);
          // at 2:19 the grid recedes outward and clears the canvas
          const away = prog(frame, T.recede + cell.d * ms(90), ms(900), EASE.camera);
          const x = lerp(end.x + (dx / len) * 1400, end.x, fly) + (dx / len) * 420 * away;
          const y = lerp(end.y + (dy / len) * 900, end.y, fly) + (dy / len) * 300 * away;
          const rot = (1 - fly) * (i % 2 ? 6 : -6);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - CW / 2,
                top: y - CH / 2,
                width: CW,
                height: CH,
                borderRadius: RF.md,
                overflow: "hidden",
                border: `${HAIRLINE}px solid ${c.border}`,
                boxShadow: shadow("sm", 1.6),
                transform: `rotate(${rot}deg) scale(${frame < land ? 1 : lerp(1.04, 1, snap)})`,
                opacity: clamp(fly * 4) * (1 - away),
              }}
            >
              <PageView id={PAGE_CYCLE[i % PAGE_CYCLE.length]!} f={frame + i * 37} width={CW} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────────────────────────── the mascot ───────────────────────────── */

const SIZE = 380;
/** The product's gaze reach multiplier (`components/kept/mascot.tsx`). */
const MASCOT_GAZE_REACH = 8;

function cursorAt(frame: number) {
  const keys = [
    { f: T.cursorIn, x: FINALE.cx + 1100, y: FINALE.cy + 200 },
    { f: T.cursorIn + ms(1100), x: FINALE.cx + 460, y: FINALE.cy - 160, ease: EASE.camera },
    { f: T.recede + ms(400), x: FINALE.cx - 380, y: FINALE.cy - 230, ease: EASE.camera },
    { f: at(141.0), x: FINALE.cx - 520, y: FINALE.cy + 40, ease: EASE.camera },
    { f: at(143.0), x: FINALE.cx + 420, y: FINALE.cy - 120, ease: EASE.camera },
    { f: T.leave, x: FINALE.cx + 520, y: FINALE.cy + 60, ease: EASE.camera },
    // and out of frame, bottom right — the mascot watches it go
    { f: T.leave + ms(1100), x: FINALE.cx + 1400, y: FINALE.cy + 1100, ease: EASE.camera },
  ];
  return { x: track(frame, keys, "x"), y: track(frame, keys, "y") };
}

const LiveMascot: React.FC<{ frame: number }> = ({ frame }) => {
  const rise = prog(frame, T.rise, ms(700), EASE.spring);
  if (frame < T.rise) return null;
  const t = (frame - T.rise) / 60;
  // the product's idle bob: ±3% over 3 s, alternating, ease-in-out
  const u = (t / 3) % 2;
  const tri = u < 1 ? u : 2 - u;
  const bob = -3 + 6 * (tri < 0.5 ? 2 * tri * tri : 1 - Math.pow(-2 * tri + 2, 2) / 2);
  const reach = (SIZE / 2) * MASCOT_GAZE_REACH;
  const gaze = smoothedGaze(frame, T.cursorIn, (f) => {
    const p = cursorAt(f);
    return { nx: (p.x - FINALE.cx) / reach, ny: (p.y - FINALE.cy) / reach };
  });
  return (
    <div
      style={{
        position: "absolute",
        left: FINALE.cx - SIZE / 2,
        top: FINALE.cy - SIZE / 2 + (1 - rise) * 260,
        transform: `translateY(${bob}%) scale(${lerp(0.6, 1, rise)})`,
        opacity: clamp(rise * 3),
      }}
    >
      <Mascot t={t} size={SIZE} gaze={gaze} id="mascot-finale" />
    </div>
  );
};

export const Act7World: React.FC = () => {
  const frame = useCurrentFrame();
  const cur = cursorAt(frame);
  return (
    <>
      <Grid frame={frame} />
      <LiveMascot frame={frame} />
      {frame >= T.cursorIn && frame < T.leave + ms(1200) ? <Cursor x={cur.x} y={cur.y} /> : null}
    </>
  );
};

export const Act7Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { c } = useTheme();
  const url = prog(frame, T.url, ms(400));
  return (
    <>
      <SuperAt id="keptByYou" x={960} y={668} size={TYPE.displayL * 0.92} width={1400} align="center" />
      {url > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", opacity: url, transform: `translateY(${(1 - url) * 12}px)` }}>
          <Mono size={30} color={c.textSecondary}>
            {HOST}
          </Mono>
        </div>
      ) : null}
    </>
  );
};
