import { DRAFT_GRACE_DAYS, DRAFT_TTL_DAYS } from "@kept/shared";
import type { Word } from "./components/Type";
import { filmSlug } from "./system/slug";

/**
 * Every word the film puts on screen that is NOT copied from a real kept
 * screen. Real product copy (button labels, chip labels, the expired page,
 * the claim screen) is imported or quoted where it is drawn, from the code.
 *
 * The brief's §9 (supers) did not arrive — it was cut off mid-§7. Supers for
 * 0:00–1:31 are the brief's own; everything after 1:31 is reconstructed in
 * the brief's voice and flagged in REVIEW.md for sign-off.
 */

/* ─────────────────────────────── URLs ─────────────────────────────── */

/** The orrery's anonymous slug, minted by the product's rules (seeded). */
export const ORRERY_SLUG = filmSlug(2026);
/** The agent's publish — also anonymous, so also a random slug. */
export const SYNTH_SLUG = filmSlug(44);
/** The three ways in (0:57–1:00) each mint their own link; the middle one is the synth. */
export const WAY_SLUGS = [filmSlug(57), SYNTH_SLUG, filmSlug(59)] as const;
/** The draft nobody kept (Act 6). */
export const LAPSED_SLUG = filmSlug(108);
/** The rename (0:40.5). Readable names are a free-tier feature. */
export const ORRERY_NAME = "orrery";
export const HOST = "kept.host";
export const WALL_HOST = `mira.${HOST}`;

/* ───────────────────────────── models ───────────────────────────── */

/**
 * `{model}` (brief §8.3, not received). Plain-text model family names for the
 * provenance chip and the Explore filters — no logos, no marks. Alphabetical
 * so no model is featured. One of the open items in REVIEW.md §15.
 */
export const MODELS = ["Claude", "Gemini", "GPT", "Llama", "Mistral"] as const;
export type Model = (typeof MODELS)[number];

/* ───────────────────────────── prompts ───────────────────────────── */

export const PROMPTS = {
  orrery: "make me a tiny solar system I can spin",
  synth16: "a pocket synth with 16 steps",
  rhine: "a river-level tracker for the Rhine",
  aquarium: "a pixel aquarium",
  platformer: "a platformer with one button",
  agent: "Make me a pocket synth and put it online.",
} as const;

/* ───────────────────────────── supers ───────────────────────────── */

export interface SuperSpec {
  /** Shot-list second the first word rises (a beat). */
  at: number;
  /** Shot-list second the exit wipe starts; omitted = holds to the end. */
  exit?: number;
  lines: Word[][];
  mono?: string;
  /** Shot-list second the mono line appears, when not straight after the words. */
  monoAt?: number;
}

const a = (t: string): Word => ({ t, accent: true });

export const SUPERS = {
  // Act 0 — MADE
  made: { at: 8.0, exit: 11.5, lines: [["AI", "makes"], ["pages", "now."]] },
  good: {
    at: 10.0,
    exit: 11.5,
    lines: [["Good", "ones."]],
    mono: "GAMES · TOOLS · SCENES · DASHBOARDS",
  },
  // Act 1 — STUCK
  // One beat earlier than the brief (13.5/15.5/17.5): at the brief's times the
  // third super gets 2.0 s of its 2.45 s minimum and collides with 0:19.5.
  screenshots: { at: 13.0, exit: 19.0, lines: [["Screenshots"], ["don't", "move."]] },
  localFiles: { at: 15.0, exit: 19.0, lines: [["Local", "files"], ["don't", "travel."]] },
  pasted: { at: 17.0, exit: 19.0, lines: [["Pasted", "code"], ["isn't", "a", "launch."]] },
  deserves: { at: 19.5, exit: 22.0, lines: [["Your", "work"], ["deserves"], ["a", a("link.")]] },
  // Act 2 — DROP
  seconds: { at: 28.0, exit: 30.75, lines: [["Live", "in", "seconds."]] },
  noAccount: { at: 29.5, exit: 30.75, lines: [["No", "account."]] },
  draft: {
    at: 34.0,
    exit: 37.5,
    lines: [["Every", "page"], ["starts", "as", "a", "draft."]],
    mono: `LIVE NOW · ${DRAFT_TTL_DAYS} DAYS TO KEEP IT`,
  },
  forever: { at: 38.0, exit: 40.0, lines: [["Kept", "—"], [a("forever.")]] },
  name: { at: 40.5, exit: 43.0, lines: [["Give", "it"], ["a", "name."]], mono: "READABLE NAMES · FREE" },
  // Act 3 — AGENTS
  agentPublishes: { at: 51.0, exit: 56.5, lines: [["Your", "agent"], ["publishes."]] },
  youKeep: {
    at: 53.0,
    exit: 56.5,
    lines: [["You", a("keep"), "it."]],
    mono: "KEYLESS AGENT PUBLISHING · FREE FOREVER",
    monoAt: 56.0,
  },
  howeverMade: { at: 60.0, exit: 61.5, lines: [["However", "it's", "made."]] },
  // Act 4 — SHARE
  showHow: { at: 68.0, exit: 70.5, lines: [["Show", "how"], ["it", "was", "made."]] },
  sharePrompt: { at: 71.0, exit: 74.5, lines: [["Share", "the", "prompt"], ["—", "if", "you", "want."]] },
  remix: { at: 75.0, exit: 78.5, lines: [["Remix", "it."]] },
  ideas: { at: 77.0, exit: 78.5, lines: [["Ideas", "travel."]] },
  explore: { at: 79.0, exit: 81.0, lines: [["Explore"], ["by", "model."]] },
  ready: { at: 81.5, exit: 84.5, lines: [["Ready"], ["to", "post."]], mono: "SHARE KIT · PRO" },
  // Act 5 — WALL (reconstructed)
  wall: { at: 91.5, exit: 96.0, lines: [["Make", "a", "wall"], ["of", "your", "work."]] },
  oneLink: { at: 101.5, exit: 106.5, lines: [["One", "link"], ["for", "everything."]], mono: WALL_HOST.toUpperCase() },
  // Act 6 — OPEN (reconstructed)
  week: {
    at: 108.5,
    exit: 112.0,
    lines: [["A", "draft"], ["lasts", "a", "week."]],
    mono: `${DRAFT_TTL_DAYS} DAYS LIVE · ${DRAFT_GRACE_DAYS} DAYS TO RECOVER`,
  },
  stays: { at: 114.0, exit: 117.5, lines: [["A", "kept", "page"], ["stays."]] },
  outlast: { at: 118.0, exit: 122.5, lines: [["Built", "to"], ["outlast", "us."]] },
  open: { at: 123.0, exit: 128.0, lines: [["Open", "source."], ["Open", "books."]] },
  // Act 7 — KEPT (reconstructed)
  keptByYou: { at: 140.0, lines: [["Made", "with", "AI."], [a("Kept"), "by", "you."]] },
} satisfies Record<string, SuperSpec>;

export type SuperId = keyof typeof SUPERS;
