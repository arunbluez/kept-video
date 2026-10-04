import { EASE } from "./tokens";

export type Ease = (t: number) => number;

export const clamp = (v: number, lo = 0, hi = 1): number =>
  Math.min(hi, Math.max(lo, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Eased 0→1 progress of a move that starts at `start` and lasts `dur` frames. */
export const prog = (
  frame: number,
  start: number,
  dur: number,
  ease: Ease = EASE.out,
): number => (dur <= 0 ? (frame >= start ? 1 : 0) : ease(clamp((frame - start) / dur)));

/**
 * Piecewise keyframe interpolation. Holds the first value before the first key
 * and the last after the last. Each segment uses the easing of the key it
 * arrives at (default `--ease-out`).
 */
export function track<K extends string>(
  frame: number,
  keys: ReadonlyArray<{ f: number; ease?: Ease } & Record<K, number>>,
  prop: K,
): number {
  const first = keys[0];
  if (!first) return 0;
  if (frame <= first.f) return first[prop];
  for (let i = 1; i < keys.length; i++) {
    const b = keys[i]!;
    if (frame < b.f) {
      const a = keys[i - 1]!;
      const t = (b.ease ?? EASE.out)(clamp((frame - a.f) / (b.f - a.f)));
      return lerp(a[prop], b[prop], t);
    }
  }
  return keys[keys.length - 1]![prop];
}

/** Quadratic bezier between two points with a perpendicular lift, for arcs. */
export function arc(
  t: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  lift: number,
): { x: number; y: number } {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  // perpendicular, pointing "up" on screen for a left→right arc
  const cx = mx + (dy / len) * lift;
  const cy = my - (Math.abs(dx) / len) * lift;
  const u = 1 - t;
  return {
    x: u * u * x0 + 2 * u * t * cx + t * t * x1,
    y: u * u * y0 + 2 * u * t * cy + t * t * y1,
  };
}

/** Deterministic PRNG (mulberry32). Every bit of "randomness" is seeded. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable hash of a string to a 32-bit seed. */
export function seedOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
