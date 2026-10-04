/**
 * VO files for the 60 s cut: split, trim, measure, check.
 *
 *   tsx scripts/vo.ts take.mp3          # one take of the whole script → vo-01 … vo-11
 *   tsx scripts/vo.ts vo-04.mp3         # a redone line (named for its id) → replaces vo-04
 *   tsx scripts/vo.ts                   # measure public/audio/vo/ (run by `pnpm render:60`)
 *
 * Every line is written to public/audio/vo/<id>.wav at 48 kHz, cut 30 ms
 * before the voice starts and 150 ms after it ends, and levelled to −16 LUFS
 * with peaks under −2 dBFS. The measured lengths go to
 * public/audio/vo/lengths.json, which the cut reads to duck the music. Eleven
 * v4 has no speed setting, so a read can run longer than planned: this fails
 * if any line would run into the next one, and says which.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { VO_LINES, voClashes, voSeconds, type VoLengths, type VoLine } from "../src/copy";
import { CUT60_FRAMES } from "../src/cut60";
import { FPS } from "../src/system/timeline";

const DIR = path.resolve("public/audio/vo");
const LENGTHS = path.join(DIR, "lengths.json");
const CUT_SECONDS = CUT60_FRAMES / FPS;
// ElevenLabs renders a clean noise floor; anything under this is a pause
const NOISE = "-45dB";
const LEAD = 0.03;
const TAIL = 0.15;
// VO level: −16 LUFS sits ~8 dB over the music ducked under it; peaks held at −2 dBFS
const TARGET_LUFS = -16;
const COMPRESS = "acompressor=threshold=0.1:ratio=2.5:attack=5:release=80";
const LIMIT = "alimiter=limit=0.794:attack=2:release=50:level=0";

type Span = { from: number; to: number };

const duration = (file: string) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).trim());

/** Where the voice is: the complement of every pause of at least `minPause` seconds. */
function speech(file: string, minPause: number): { spans: Span[]; pauses: Span[]; length: number } {
  const length = duration(file);
  const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", `silencedetect=noise=${NOISE}:d=${minPause}`, "-f", "null", "-"], {
    encoding: "utf8",
  });
  const starts = [...stderr.matchAll(/silence_start: (-?[\d.]+)/g)].map((m) => Math.max(0, Number(m[1])));
  const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const pauses = starts.map((from, i) => ({ from, to: ends[i] ?? length }));
  const spans: Span[] = [];
  let t = 0;
  for (const p of pauses) {
    if (p.from > t) spans.push({ from: t, to: p.from });
    t = p.to;
  }
  if (t < length) spans.push({ from: t, to: length });
  return { spans, pauses, length };
}

const loudness = (file: string, filter: string) => {
  const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", `${filter}ebur128`, "-f", "null", "-"], { encoding: "utf8" });
  return Number(/I:\s+(-?[\d.]+) LUFS/.exec(stderr.slice(stderr.lastIndexOf("Summary")))?.[1]);
};

/**
 * One level for everything cut from `file`: gain to the target, gentle
 * compression, make-up to the target again, then a peak limiter. Lines from
 * one take share it, so they keep their level relative to each other.
 */
function levelling(file: string) {
  const g1 = TARGET_LUFS - loudness(file, "");
  const g2 = TARGET_LUFS - loudness(file, `volume=${g1.toFixed(2)}dB,${COMPRESS},`);
  return `volume=${g1.toFixed(2)}dB,${COMPRESS},volume=${g2.toFixed(2)}dB,${LIMIT}`;
}

/** Cut [from, to] of `file` to the line's wav, levelled, with 10 ms / 30 ms fades against clicks. */
function write(file: string, level: string, line: VoLine, from: number, to: number) {
  fs.mkdirSync(DIR, { recursive: true });
  const out = path.join(DIR, `${line.id}.wav`);
  const len = to - from;
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-i", file,
    // atrim + asetpts: the fades below count from the line's start, not the take's
    "-af", `atrim=start=${from.toFixed(3)}:end=${to.toFixed(3)},asetpts=PTS-STARTPTS,${level},afade=t=in:d=0.01,afade=t=out:st=${(len - 0.03).toFixed(3)}:d=0.03`,
    "-ar", "48000", "-c:a", "pcm_s16le", out,
  ]);
  console.log(`${line.id}  ${len.toFixed(2)} s  ← ${path.basename(file)} ${from.toFixed(2)}–${to.toFixed(2)} s`);
}

/** One line in its own file: trim to the voice. */
function trimLine(file: string, line: VoLine) {
  const { spans, length } = speech(file, 0.05);
  if (!spans.length) throw new Error(`${file}: no voice found above ${NOISE}`);
  write(file, levelling(file), line, Math.max(0, spans[0]!.from - LEAD), Math.min(length, spans.at(-1)!.to + TAIL));
}

/**
 * The whole script in one take: the ten longest pauses between voice are the
 * breaks between the eleven lines ([long pause] in the script). A split whose
 * pieces don't match the lines' expected lengths is refused, not guessed at.
 */
function splitTake(file: string) {
  const { spans, pauses, length } = speech(file, 0.3);
  // a short silence before the first word or after the last isn't a break, but it isn't voice either
  const fine = speech(file, 0.05).spans;
  if (!spans.length || !fine.length) throw new Error(`${file}: no voice found above ${NOISE}`);
  const first = { from: fine[0]!.from, to: spans[0]!.to };
  const last = { from: spans.at(-1)!.from, to: fine.at(-1)!.to };
  const inner = pauses.filter((p) => p.from > first.from && p.to < last.to);
  const breaks = [...inner].sort((a, b) => b.to - b.from - (a.to - a.from)).slice(0, VO_LINES.length - 1).sort((a, b) => a.from - b.from);
  if (breaks.length !== VO_LINES.length - 1) {
    throw new Error(`${file}: found ${breaks.length + 1} lines, expected ${VO_LINES.length} — is there a pause between every line?`);
  }
  // the breaks must stand clear of the pauses inside lines (between sentences, the ellipsis)
  const gap = (p: Span) => p.to - p.from;
  const shortestBreak = Math.min(...breaks.map(gap));
  const longestInside = Math.max(0, ...inner.filter((p) => !breaks.includes(p)).map(gap));
  if (shortestBreak < 1.3 * longestInside) {
    throw new Error(
      `${file}: the pauses between lines (shortest ${shortestBreak.toFixed(2)} s) aren't clearly longer than the pauses inside them (${longestInside.toFixed(2)} s). Lengthen the pauses, or send the lines as separate files.`,
    );
  }
  const edges = [{ from: 0, to: first.from }, ...breaks, { from: last.to, to: length }];
  const pieces = VO_LINES.map((line, i) => {
    const from = edges[i]!.to;
    const to = edges[i + 1]!.from;
    return { line, from: Math.max(edges[i]!.from, from - LEAD), to: Math.min(edges[i + 1]!.to, to + TAIL), voice: to - from };
  });
  // a piece far from its line's expected length means a pause landed inside a line
  const odd = pieces.filter((p) => {
    const r = p.voice / voSeconds(p.line.text);
    return r < 0.4 || r > 2.2;
  });
  if (odd.length) {
    for (const p of pieces) console.log(`${p.line.id}  ${p.voice.toFixed(2)} s of voice, ~${voSeconds(p.line.text).toFixed(2)} s expected`);
    throw new Error(`${file}: the pauses don't fall between lines (${odd.map((p) => p.line.id).join(", ")}). Lengthen the pauses, or send the lines as separate files.`);
  }
  const level = levelling(file);
  for (const p of pieces) write(file, level, p.line, p.from, p.to);
}

/** The lengths of the VO files that exist. */
export function measureVo(): VoLengths {
  const lengths: VoLengths = {};
  for (const l of VO_LINES) {
    const file = [".wav", ".mp3"].map((x) => path.join(DIR, l.id + x)).find((f) => fs.existsSync(f));
    if (file) lengths[l.id] = Math.round(duration(file) * 1000) / 1000;
  }
  return lengths;
}

function main() {
  for (const file of process.argv.slice(2)) {
    const id = /vo-\d\d/.exec(path.basename(file))?.[0];
    const line = VO_LINES.find((l) => l.id === id);
    if (line) trimLine(file, line);
    else splitTake(file);
  }
  const lengths = measureVo();
  const ids = Object.keys(lengths);
  if (!ids.length) {
    console.log("no VO files in public/audio/vo — the cut plays without VO");
    return;
  }
  fs.writeFileSync(LENGTHS, JSON.stringify(lengths, null, 2) + "\n");
  const clashes = voClashes(lengths, CUT_SECONDS);
  const sorted = [...VO_LINES].sort((a, b) => a.at - b.at);
  for (const [i, l] of sorted.entries()) {
    const room = (sorted[i + 1]?.at ?? CUT_SECONDS) - l.at;
    const len = lengths[l.id];
    const state = len === undefined ? "missing" : clashes.includes(l.id) ? "RUNS OVER" : "ok";
    console.log(`${l.id}  at ${l.at.toFixed(2)}  ${len === undefined ? "  –   " : `${len.toFixed(2)} s`} of ${room.toFixed(2)} s  ${state}`);
  }
  console.log(`${ids.length}/${VO_LINES.length} lines → ${path.relative(process.cwd(), LENGTHS)}`);
  if (clashes.length) {
    console.error(`\n${clashes.join(", ")} would run into the next line. Regenerate it a little tighter, or move its \`at\` in src/copy.ts.`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}
