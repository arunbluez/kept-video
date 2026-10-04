/**
 * The film's clock, authored in bars and beats (brief §6).
 *
 * 120 BPM, 4/4: a beat is 0.5 s = 30 frames, a bar 2 s = 120 frames. Every key
 * hit in the film is placed with `at()` / `bb()`, which go through the beat
 * grid — so a licensed track with a slightly different tempo or a shifted first
 * downbeat is absorbed by changing the TWO numbers below, and nothing else.
 *
 *   BPM              the track's tempo
 *   DOWNBEAT_OFFSET  frames from film frame 0 to the track's bar 1, beat 1
 */
export const FPS = 60;
export const BPM = 120;
export const DOWNBEAT_OFFSET = 0;

export const BEATS_PER_BAR = 4;
/** The brief's shot list is written in seconds at its nominal 120 BPM. */
const NOMINAL_BPM = 120;

export const FRAMES_PER_BEAT = (FPS * 60) / BPM;

/** Frame of a (possibly fractional) beat count from bar 1, beat 1. */
export const beatFrame = (beats: number): number =>
  Math.round(DOWNBEAT_OFFSET + beats * FRAMES_PER_BEAT);

/** Frame of `bar`, `beat` (both 1-indexed, like a DAW), plus a beat fraction. */
export const bb = (bar: number, beat = 1, frac = 0): number =>
  beatFrame((bar - 1) * BEATS_PER_BAR + (beat - 1) + frac);

/**
 * Frame of a shot-list time. `sec` is nominal film seconds (`0:26.5` → 26.5);
 * it is converted to beats first, so the hit stays on its beat whatever the
 * real tempo is. Use ONLY for hits — sub-beat timing inside a move uses `ms()`.
 * `scripts/check.ts` asserts every literal passed here sits on the eighth-note
 * grid, and every hit the brief names sits on a beat.
 */
export const at = (sec: number): number =>
  beatFrame((sec * NOMINAL_BPM) / 60);

/** A duration in beats, as frames. */
export const beats = (n: number): number => Math.round(n * FRAMES_PER_BEAT);

/** A duration in milliseconds, as (fractional) frames. Tempo-independent. */
export const ms = (n: number): number => (n / 1000) * FPS;

/** The acts (brief §6). Bars are inclusive, 1-indexed. */
export const ACTS = [
  { id: 0, chapter: "00 / MADE", fromBar: 1, toBar: 6 },
  { id: 1, chapter: "01 / STUCK", fromBar: 7, toBar: 11 },
  { id: 2, chapter: "02 / DROP", fromBar: 12, toBar: 22 },
  { id: 3, chapter: "03 / AGENTS", fromBar: 23, toBar: 32 },
  { id: 4, chapter: "04 / SHARE", fromBar: 33, toBar: 43 },
  { id: 5, chapter: "05 / WALL", fromBar: 44, toBar: 54 },
  { id: 6, chapter: "06 / OPEN", fromBar: 55, toBar: 66 },
  { id: 7, chapter: "07 / KEPT", fromBar: 67, toBar: 75 },
] as const;

export const actFrom = (id: number): number => bb(ACTS[id]!.fromBar);
export const actTo = (id: number): number => bb(ACTS[id]!.toBar + 1);

/** 75 bars: 150 s, 9000 frames at the nominal tempo. */
export const DURATION_IN_FRAMES = actTo(7);

/**
 * The three camera whips (T4) — the only motion-blurred moments in the film.
 * Each lasts one beat and lands on the next act's downbeat.
 */
export const WHIPS = [at(43.5), at(85.0), at(107.5)].map((from) => ({
  from,
  to: from + beats(1),
}));

/** Light → dark → light (T5), Act 6 only, each swap ≥ 3 s (brief §4.2). */
export const THEME_SWAPS = [
  { from: at(112.0), to: at(116.0), dir: 1 },
  { from: at(128.5), to: at(131.5), dir: -1 },
] as const;

/**
 * Windows where the HUD is hidden: a page fills the frame, and the finale from
 * 2:19 (brief §5.4).
 */
export const HUD_HIDDEN = [
  { from: at(31.0), to: at(33.0) },
  { from: at(62.5), to: at(66.0) },
  { from: at(139.0), to: DURATION_IN_FRAMES },
] as const;

export const chapterAt = (frame: number): string => {
  for (let i = ACTS.length - 1; i >= 0; i--) {
    if (frame >= actFrom(i)) return ACTS[i]!.chapter;
  }
  return ACTS[0].chapter;
};
