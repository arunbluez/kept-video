import { at, beats, chapterAt } from "./system/timeline";

/**
 * The 60-second cut, as an edit of the 150 s film.
 *
 * Four continuous stretches of the film, each starting and ending on a bar
 * line, so the picture's hits stay on the music's beats through every cut and
 * the music and SFX can be conformed with exactly the same edit
 * (scripts/audio.ts). Nothing is re-animated: the cut plays the film's own
 * frames, so it can never drift from it.
 *
 *   0:00–0:06   film 0:06–0:12   AI makes pages. Good ones.
 *   0:06–0:30   film 0:16–0:40   stuck → a link → drop, mint, live → draft → kept forever
 *   0:30–0:48   film 0:48–1:06   your agent publishes, you keep it → however it's made → the synth
 *   0:48–1:00   film 2:14–2:26   everything on one grid → the mascot → Made with AI. Kept by you.
 *
 * Only shipped behaviour carries the cut's message: the remix, Explore,
 * share-kit and wall sequences (CLAIMS.md "Not built") are left out.
 */
export const CUT60: ReadonlyArray<{ from: number; to: number }> = [
  { from: 6.0, to: 12.0 },
  { from: 16.0, to: 40.0 },
  { from: 48.0, to: 66.0 },
  { from: 134.0, to: 146.0 },
];

export interface Piece {
  /** Film frames, [srcFrom, srcTo). */
  srcFrom: number;
  srcTo: number;
  /** Where the piece starts in the cut. */
  outFrom: number;
}

export const PIECES: Piece[] = (() => {
  let out = 0;
  return CUT60.map((c) => {
    const p = { srcFrom: at(c.from), srcTo: at(c.to), outFrom: out };
    out += p.srcTo - p.srcFrom;
    return p;
  });
})();

export const CUT60_FRAMES = PIECES.reduce((n, p) => n + (p.srcTo - p.srcFrom), 0);

/** Cuts are a hairline wipe (T1), one eighth note long, starting on the bar. */
export const WIPE = beats(0.5);

/** The film frame shown at a frame of the cut. */
export function sourceFrame(out: number): number {
  for (let i = PIECES.length - 1; i >= 0; i--) {
    const p = PIECES[i]!;
    if (out >= p.outFrom) return p.srcFrom + (out - p.outFrom);
  }
  return PIECES[0]!.srcFrom;
}

/**
 * Inside a wipe: how far the hairline has crossed (0→1) and the frame of the
 * outgoing piece, which runs on past its end while the line crosses it.
 */
export function wipeAt(out: number): { p: number; outgoing: number } | null {
  for (let i = 1; i < PIECES.length; i++) {
    const p = PIECES[i]!;
    const t = out - p.outFrom;
    if (t >= 0 && t < WIPE) {
      const prev = PIECES[i - 1]!;
      return { p: t / WIPE, outgoing: prev.srcTo + t };
    }
  }
  return null;
}

/**
 * The HUD's chapter label in the cut: the film's chapter name, renumbered in
 * the order the cut meets them, so the count never jumps (00, 01, 02 … 05).
 */
const CHAPTER_ORDER: string[] = (() => {
  const names: string[] = [];
  for (const p of PIECES) {
    for (let f = p.srcFrom; f < p.srcTo; f += beats(1)) {
      const name = chapterAt(f).split(" / ")[1]!;
      if (!names.includes(name)) names.push(name);
    }
  }
  return names;
})();

export const cutChapter = (src: number): string => {
  const name = chapterAt(src).split(" / ")[1]!;
  return `${String(CHAPTER_ORDER.indexOf(name)).padStart(2, "0")} / ${name}`;
};
