import { JSON_TEXT, PROMPTS } from "../copy";
import { at, beats, ms } from "./timeline";
import { keystrokes } from "./typing";

/**
 * The film's sound cues, in one place. Typed text windows live here too, so
 * the scenes that type and the key ticks that accompany them read the same
 * numbers. Pure data: scripts/audio.ts mixes `CUES` into public/audio/sfx.wav.
 */

export interface TypingRun {
  text: string;
  from: number;
  to: number;
  seed?: string;
}

export const TYPING = {
  orrery: { text: PROMPTS.orrery, from: at(1.5), to: at(4.0) },
  synth16: { text: PROMPTS.synth16, from: at(6.0), to: at(6.0) + ms(440) },
  rhine: { text: PROMPTS.rhine, from: at(7.0), to: at(7.0) + ms(440) },
  aquarium: { text: PROMPTS.aquarium, from: at(8.0), to: at(8.0) + ms(440) },
  platformer: { text: PROMPTS.platformer, from: at(9.0), to: at(9.0) + ms(440) },
  email: { text: "mira@example.com", from: at(37.0) + ms(200), to: at(37.5) - ms(120) },
  agentPrompt: { text: PROMPTS.agent, from: at(44.5), to: at(44.5) + ms(1100) },
  json: { text: JSON_TEXT, from: at(48.0), to: at(48.0) + ms(1800), seed: "json" },
  wayAgent: { text: "put this online", from: at(57.5), to: at(58.25) },
} satisfies Record<string, TypingRun>;

/** Act 0's prompt field, in order. */
export const PROMPT_RUNS: TypingRun[] = [TYPING.orrery, TYPING.synth16, TYPING.rhine, TYPING.aquarium, TYPING.platformer];

export type Sfx =
  | "key"
  | "click"
  | "pop"
  | "snap"
  | "thock"
  | "pour"
  | "chime"
  | "shutter"
  | "bump"
  | "keep"
  | "whoosh"
  | "scramble"
  | "impact";

export interface Cue {
  f: number;
  sfx: Sfx;
  gain?: number;
  /** Frames, for sounds with a length (whoosh, pour, scramble). */
  dur?: number;
  /** −1 (left) … 1 (right). */
  pan?: number;
}

const keys = (run: TypingRun, gain = 0.5): Cue[] =>
  keystrokes(run.from, run.to, run.text, run.seed).map((f, i) => ({ f, sfx: "key", gain: gain * (0.8 + ((i * 7) % 5) * 0.08), pan: ((i % 5) - 2) * 0.08 }));

/** `n` cues from `from`, every `step` beats (0.5 = eighths, 0.25 = sixteenths). */
const onGrid = (from: number, n: number, sfx: Sfx, gain: number, step: number): Cue[] =>
  Array.from({ length: n }, (_, i) => ({ f: at(from) + Math.round(i * beats(step)), sfx, gain, pan: ((i % 4) - 1.5) * 0.25 }));

export const CUES: Cue[] = [
  // Act 0 — MADE
  ...keys(TYPING.orrery),
  { f: at(4.0), sfx: "click", gain: 0.6 },
  { f: at(4.0) + ms(200), sfx: "pour", gain: 0.18, dur: at(5.5) - at(4.0) },
  { f: at(5.5) + ms(160), sfx: "snap", gain: 0.5 },
  ...[TYPING.synth16, TYPING.rhine, TYPING.aquarium, TYPING.platformer].flatMap((r) => [
    ...keys(r, 0.35),
    { f: r.from + ms(500), sfx: "pop" as const, gain: 0.45 },
  ]),
  { f: at(12.0), sfx: "whoosh", gain: 0.22, dur: ms(1200), pan: 0.6 },
  // Act 1 — STUCK
  { f: at(13.5), sfx: "shutter", gain: 0.7 },
  { f: at(15.0) + ms(900), sfx: "bump", gain: 0.6 },
  { f: at(17.0) + ms(200), sfx: "click", gain: 0.5 },
  { f: at(17.0) + ms(200), sfx: "pour", gain: 0.12, dur: ms(500) },
  // Act 2 — DROP
  { f: at(22.0), sfx: "impact", gain: 0.9 },
  { f: at(23.0), sfx: "click", gain: 0.5 },
  { f: at(24.5), sfx: "pop", gain: 0.35 },
  { f: at(25.0), sfx: "thock", gain: 1 },
  { f: at(25.0), sfx: "pour", gain: 0.45, dur: at(26.5) - at(25.0) - ms(100) },
  { f: at(26.5), sfx: "chime", gain: 0.9 },
  { f: at(26.5), sfx: "scramble", gain: 0.35, dur: ms(560) },
  { f: at(27.25), sfx: "click", gain: 0.6 },
  { f: at(31.0), sfx: "whoosh", gain: 0.2, dur: ms(700) },
  { f: at(32.0), sfx: "click", gain: 0.4 },
  { f: at(37.0), sfx: "click", gain: 0.6 },
  ...keys(TYPING.email, 0.3),
  { f: at(37.5), sfx: "click", gain: 0.6 },
  { f: at(38.0), sfx: "keep", gain: 0.9 },
  { f: at(40.5), sfx: "click", gain: 0.5 },
  { f: at(40.5) + ms(160), sfx: "click", gain: 0.5 },
  { f: at(41.0), sfx: "scramble", gain: 0.35, dur: ms(320) },
  // T4 #1
  { f: at(43.5), sfx: "whoosh", gain: 0.85, dur: beats(1), pan: -0.8 },
  // Act 3 — AGENTS
  ...keys(TYPING.agentPrompt, 0.4),
  { f: at(46.0), sfx: "pop", gain: 0.3 },
  { f: at(47.0), sfx: "snap", gain: 0.4 },
  ...keys(TYPING.json, 0.14),
  { f: at(53.5), sfx: "whoosh", gain: 0.25, dur: ms(500), pan: 0.4 },
  { f: at(54.5), sfx: "click", gain: 0.6 },
  { f: at(54.5), sfx: "keep", gain: 0.8 },
  { f: at(54.5) + ms(200), sfx: "pop", gain: 0.4 },
  { f: at(58.0), sfx: "click", gain: 0.4 },
  { f: at(57.5) + ms(700), sfx: "thock", gain: 0.45 },
  ...keys(TYPING.wayAgent, 0.25),
  { f: at(60.0), sfx: "chime", gain: 0.6 },
  { f: at(60.0) + ms(1000), sfx: "snap", gain: 0.5 },
  { f: at(62.0), sfx: "whoosh", gain: 0.2, dur: ms(1200) },
  // Act 4 — SHARE
  ...onGrid(66.0, 3, "snap", 0.35, 1),
  { f: at(69.0), sfx: "click", gain: 0.55 },
  { f: at(73.0), sfx: "click", gain: 0.55 },
  ...[73.5, 74.0, 74.5, 75.5, 76.0].map((t): Cue => ({ f: at(t), sfx: "snap", gain: 0.5 })),
  { f: at(78.0), sfx: "whoosh", gain: 0.2, dur: ms(1000) },
  { f: at(79.5), sfx: "click", gain: 0.5 },
  { f: at(81.5), sfx: "pop", gain: 0.45 },
  { f: at(81.5) + ms(500), sfx: "snap", gain: 0.4 },
  // T4 #2
  { f: at(85.0), sfx: "whoosh", gain: 0.85, dur: beats(2), pan: 0.8 },
  // Act 5 — WALL: one snap per block, on the eighths
  { f: at(86.5), sfx: "pop", gain: 0.4 },
  ...onGrid(87.0, 15, "snap", 0.42, 0.5),
  { f: at(98.0), sfx: "click", gain: 0.5 },
  { f: at(99.0), sfx: "snap", gain: 0.6 },
  { f: at(101.0), sfx: "whoosh", gain: 0.2, dur: ms(800) },
  // T4 #3
  { f: at(107.5), sfx: "whoosh", gain: 0.85, dur: beats(1), pan: -0.8 },
  // Act 6 — OPEN
  { f: at(113.0), sfx: "chime", gain: 0.35 },
  ...onGrid(124.0, 3, "snap", 0.3, 1),
  // Act 7 — KEPT: the grid lands on the sixteenths, the mascot rises
  ...onGrid(132.0, 20, "snap", 0.3, 0.25),
  { f: at(136.0), sfx: "keep", gain: 0.8 },
];
