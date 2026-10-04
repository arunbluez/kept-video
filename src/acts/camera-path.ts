import type { Ease } from "../system/anim";
import { at, ms } from "../system/timeline";
import { EASE } from "../system/tokens";
import { REGION } from "../system/world";

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

/** Act 2: the browser frame the link pill opens into (region-local centre). */
export const A2_FRAME = { cx: 960, cy: 540, w: 1600, h: 972 };
const a2Frame = { x: REGION.a1.x + A2_FRAME.cx, y: REGION.a1.y + A2_FRAME.cy };
/** The frame sits right, canvas on the left for the super. */
const A2_SIDE = frameAt(a2Frame.x, a2Frame.y, 1330, 560, 0.7);
/** The rename: the address bar large enough to read, page running off right. */
const A2_RENAME = frameAt(REGION.a1.x + 160, REGION.a1.y + 54, 760, 250, 0.92);

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
];
