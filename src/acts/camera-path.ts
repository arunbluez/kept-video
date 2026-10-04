import type { Ease } from "../system/anim";
import { at, ms } from "../system/timeline";
import { EASE } from "../system/tokens";
import { REGION } from "../system/world";
import { FINALE, PHONE_CENTRE, WALL_CENTRE, wallPoint } from "./geometry";

export interface CamKey {
  f: number;
  x: number;
  y: number;
  s: number;
  r?: number;
  ease?: Ease;
}

const C = EASE.camera;
const centre = (r: { x: number; y: number }, dx = 0, dy = 0) => ({
  x: r.x + 960 + dx,
  y: r.y + 540 + dy,
});

/** A framing that puts world point (wx, wy) at screen point (sx, sy) at zoom s. */
const frameAt = (wx: number, wy: number, sx: number, sy: number, s: number) => ({
  x: wx - (sx - 960) / s,
  y: wy - (sy - 540) / s,
  s,
});

const A0 = centre(REGION.a0);
const A1 = centre(REGION.a1);
const A3 = centre(REGION.a3);
const A6 = centre(REGION.a6);

/** Act 2: the browser frame the link pill opens into (region-local centre). */
export const A2_FRAME = { cx: 960, cy: 540, w: 1600, h: 972 };
const a2Frame = { x: REGION.a1.x + A2_FRAME.cx, y: REGION.a1.y + A2_FRAME.cy };
/** The frame sits right, canvas on the left for the super. */
const A2_SIDE = frameAt(a2Frame.x, a2Frame.y, 1330, 560, 0.7);
/** The rename: the address bar large enough to read, page running off right. */
const A2_RENAME = frameAt(REGION.a1.x + 160, REGION.a1.y + 54, 760, 250, 0.92);

const a4 = (x: number, y: number) => ({ x: REGION.a3.x + x, y: REGION.a3.y + y });
const A4_SIDE = frameAt(a4(960, 540).x, a4(960, 540).y, 1330, 520, 0.62);
const A4_TREE = { ...a4(433, 817), s: 0.6 };
const A4_TREE_LOW = { ...a4(433, 1500), s: 0.6 };
const A4_EXPLORE = { ...a4(960, 1880 + 540), s: 1 };

const a5 = (p: { x: number; y: number }) => ({ x: REGION.a5.x + p.x, y: REGION.a5.y + p.y });
const A5_WALL = { ...a5(WALL_CENTRE), s: 0.57 };
const A5_WALL_SIDE = { ...a5({ x: WALL_CENTRE.x - (1324 - 960) / 0.57, y: WALL_CENTRE.y }), s: 0.57 };
const A5_FLY_1 = { ...a5(wallPoint(560, 640)), s: 0.95 };
const A5_FLY_2 = { ...a5(wallPoint(1300, 1250)), s: 0.95 };
const A5_PHONE = { ...a5({ x: PHONE_CENTRE.x - (1320 - 960), y: PHONE_CENTRE.y }), s: 1 };

/**
 * Every camera move in the film. Keys arrive with the easing given (default
 * `--ease-out`); travel uses `ease-camera`. Holds are pairs of equal keys.
 */
export const CAMERA_KEYS: CamKey[] = [
  // Act 0 — MADE
  { f: 0, ...A0, s: 1 },
  { f: at(12.0), ...A0, s: 1 },
  // Act 1 — camera travels right (1.2 s)
  { f: at(12.0) + ms(1200), ...A1, s: 1, ease: C },
  // Act 2 — push into the pill as it opens (T3), then ease back
  { f: at(31.0), ...A1, s: 1 },
  { f: at(31.0) + ms(700), x: a2Frame.x, y: a2Frame.y, s: 1.08, ease: C },
  { f: at(33.0), x: a2Frame.x, y: a2Frame.y, s: 1.08 },
  { f: at(33.0) + ms(1400), ...A2_SIDE, ease: C },
  { f: at(40.0), ...A2_SIDE },
  { f: at(40.0) + ms(700), ...A2_RENAME, ease: C },
  { f: at(43.5), ...A2_RENAME },
  // T4 #1 — whip to Act 3 (one beat, lands on the bar 23 downbeat)
  { f: at(44.0), ...A3, s: 1, ease: C },
  // Act 3 — AGENTS: a held frame
  { f: at(62.0), ...A3, s: 1 },
  // Act 4 — SHARE: push into the synth until it fills the frame (page 1600 → 1920)
  { f: at(62.0) + ms(1200), x: REGION.a3.x + 960, y: REGION.a3.y + 54 + 72 + 450, s: 1.2, ease: C },
  { f: at(66.0), x: REGION.a3.x + 960, y: REGION.a3.y + 54 + 72 + 450, s: 1.2 },
  // ease back: the page at ~62%, in its frame, canvas left for the super
  { f: at(66.0) + ms(1400), ...A4_SIDE, ease: C },
  { f: at(73.0), ...A4_SIDE },
  // the remix tree, then tilt down to follow the grandchildren
  { f: at(73.0) + ms(1200), ...A4_TREE, ease: C },
  { f: at(75.0), ...A4_TREE },
  { f: at(75.0) + ms(1200), ...A4_TREE_LOW, ease: C },
  { f: at(78.0), ...A4_TREE_LOW },
  // Explore
  { f: at(78.0) + ms(1000), ...A4_EXPLORE, ease: C },
  { f: at(85.0), ...A4_EXPLORE },
  // T4 #2 — whip out to the wall (two beats, lands on the bar 44 downbeat)
  { f: at(86.0), ...A5_WALL, ease: C },
  // Act 5 — WALL: the whole wall while it fills, then room for the super
  { f: at(91.0), ...A5_WALL },
  { f: at(91.0) + ms(800), ...A5_WALL_SIDE, ease: C },
  { f: at(94.0), ...A5_WALL_SIDE },
  // the flyover (the wall plane tilts back while the camera travels)
  { f: at(95.5), ...A5_FLY_1, ease: C },
  { f: at(97.0), ...A5_FLY_2, ease: C },
  { f: at(98.0), ...A5_WALL, ease: C },
  { f: at(101.0), ...A5_WALL },
  // T3 frame → phone
  { f: at(101.0) + ms(800), ...A5_PHONE, ease: C },
  { f: at(107.5), ...A5_PHONE },
  // T4 #3 — whip to Act 6 (one beat, lands on the bar 55 downbeat)
  { f: at(108.0), ...A6, s: 1, ease: C },
  // Act 6 — OPEN: a slow breath in on the lapsed draft, then held through the dark
  { f: at(112.0), ...A6, s: 1.03, ease: EASE.linear },
  { f: at(113.0), ...A6, s: 1, ease: C },
  { f: at(132.0), ...A6, s: 1 },
  // Act 7 — KEPT: pull back as the grid lands, then settle on the mascot
  { f: at(134.5), x: REGION.a6.x + FINALE.cx, y: REGION.a6.y + FINALE.cy, s: 0.72, ease: C },
  { f: at(139.0), x: REGION.a6.x + FINALE.cx, y: REGION.a6.y + FINALE.cy, s: 0.72 },
  { f: at(139.0) + ms(1200), x: REGION.a6.x + FINALE.cx, y: REGION.a6.y + FINALE.cy + 100, s: 1, ease: C },
];
