import { DOWNBEAT_OFFSET, FPS, FRAMES_PER_BEAT } from "./timeline";

/**
 * The pocket synth's pattern. ONE definition, read by the page the film shows
 * (`src/pages/Synth.tsx`) and by the temp-bed synthesiser (`scripts/audio.ts`),
 * so the 16 steps on screen light exactly on the soundtrack's 16th notes and
 * play its notes (brief §7, 1:04.0). With a licensed track the lights still
 * land on its 16ths through `DOWNBEAT_OFFSET` / `BPM`.
 */
export const SYNTH_STEPS: ReadonlyArray<number | null> = [
  // semitones above A2 (110 Hz); null = rest
  0, null, 12, 0, null, 7, null, 12, 0, null, 10, null, 7, null, 12, 5,
];

/** Drum grid for the remix that became a drum machine: kick, snare, hat, clap. */
export const DRUM_ROWS: ReadonlyArray<ReadonlyArray<0 | 1>> = [
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
];

/** Index (0–15) of the 16th note sounding at a film frame. */
export const sixteenthAt = (frame: number): number => {
  const sixteenths = Math.floor(((frame - DOWNBEAT_OFFSET) / FRAMES_PER_BEAT) * 4);
  return ((sixteenths % 16) + 16) % 16;
};

/** 0→1 decay envelope since the current 16th started, for pad flashes. */
export const sixteenthPhase = (frame: number): number => {
  const pos = ((frame - DOWNBEAT_OFFSET) / FRAMES_PER_BEAT) * 4;
  return pos - Math.floor(pos);
};

/** Seconds of film time at a frame. */
export const secondsAt = (frame: number): number => frame / FPS;
