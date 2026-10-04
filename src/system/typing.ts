import { rng, seedOf } from "./anim";

/*
 * Typing rhythm, shared by the scenes that type (prompts, the agent chat, the
 * sign-in email) and by the SFX cue list, which ticks a key on every stroke.
 * Pure: no React, so scripts/audio.ts can read it in Node.
 */

/**
 * Typewriter with a human rhythm: seeded per-key intervals of 40–90 ms,
 * stretched to fill exactly [start, end]. For prompts, terminal, JSON and URLs
 * only — never display type. Returns the visible prefix.
 */
export function typed(frame: number, start: number, end: number, text: string, seed = text): string {
  if (frame < start) return "";
  if (frame >= end) return text;
  const r = rng(seedOf(seed));
  const gaps = text.split("").map((ch) => (40 + r() * 50) * (ch === " " ? 1.4 : 1));
  const total = gaps.reduce((a, b) => a + b, 0);
  const k = (end - start) / total;
  let acc = start;
  for (let i = 0; i < text.length; i++) {
    acc += gaps[i]! * k;
    if (frame < acc) return text.slice(0, i);
  }
  return text;
}

/** Keystroke frames for a `typed()` run — the SFX cue list reads these. */
export function keystrokes(start: number, end: number, text: string, seed = text): number[] {
  const r = rng(seedOf(seed));
  const gaps = text.split("").map((ch) => (40 + r() * 50) * (ch === " " ? 1.4 : 1));
  const total = gaps.reduce((a, b) => a + b, 0);
  const k = (end - start) / total;
  let acc = start;
  return gaps.map((g) => (acc += g * k));
}
