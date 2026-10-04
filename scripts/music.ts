/**
 * Fit a generated music take to the picture: an edit on bar lines.
 *
 *   tsx scripts/music.ts 60  music-60.mp3     # → public/audio/music-60.wav
 *   tsx scripts/music.ts 150 music-150.mp3    # → public/audio/music.wav
 *
 * The ElevenLabs takes hold 120 BPM exactly and sit on the film's grid (their
 * downbeats fall ~20 ms after each even second), but they place their sections
 * by their own reading of the prompt, so the drops arrive early. Each edit is
 * the take's bars in the order the film plays them. Every seam joins bars that
 * measured near-identical (chroma + MFCC per beat), with a 16 ms equal-power
 * crossfade that ends before the incoming downbeat.
 *
 * The edits are made for these two takes. Another take needs its own: send it
 * over, or rewrite `bars` from a bar-by-bar listen.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";

const SR = 48000;
const BAR = 2; // seconds, 4/4 at 120 BPM
const XF = 0.016;
const PRE = 0.012; // each seam sits this far before the downbeat, so the crossfade ends before it

type Edit = {
  /** The take this edit was made for: its length (to catch a different take) and its downbeat phase. */
  take: { seconds: number; phase: number };
  out: string;
  seconds: number;
  /** Bars of the take, [from, to), in playing order. Bar b starts at phase + 2b s. */
  bars: [number, number][];
};

const EDITS: Record<"60" | "150", Edit> = {
  // take: intro 0–3 (riser in 3), kick 4–10, fill 11, drop 12–27, ending 28–29
  "60": {
    take: { seconds: 60.03, phase: 0.02 },
    out: "public/audio/music-60.wav",
    seconds: 60,
    bars: [
      [0, 2], // 0:00 intro, two bars
      [3, 4], // 0:04 its riser
      [9, 28], // 0:06 the kick on the first cut · 0:10 fill · 0:12 the drop on the tile, all 16 bars
      [10, 14], // 0:44 build + fill again · 0:48 a second drop on the grid snap
      [26, 30], // 0:52 the drop's last two bars · 0:56 the take's own ending
    ],
  },
  // take: intro 0–7, drop 8, breaks at 15/39/47, kick out 54, breakdown 56, lift 65, ending 72
  "150": {
    take: { seconds: 150.05, phase: 0.02 },
    out: "public/audio/music.wav",
    seconds: 150,
    bars: [
      [0, 4], // 0:00 intro …
      [1, 44], // 0:08 … three bars longer, so the drop lands on the tile at 0:22; a break re-enters at 1:26 with the whip
      [47, 75], // 1:34 three groove bars out: from here the take plays at its own times — kick out 1:48, breakdown 1:52, lift 2:10
    ],
  },
};

const take = (file: string) => {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "f32le", "-ac", "2", "-ar", String(SR), "-"], { maxBuffer: 1 << 30 });
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};

function render(edit: Edit, file: string) {
  const seconds = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }));
  if (Math.abs(seconds - edit.take.seconds) > 0.2) {
    throw new Error(`${file} is ${seconds.toFixed(2)} s; this edit was made for a ${edit.take.seconds} s take. A new take needs a new edit.`);
  }
  const total = edit.bars.reduce((n, [a, b]) => n + b - a, 0) * BAR;
  if (total !== edit.seconds) throw new Error(`the edit's bars add up to ${total} s, not ${edit.seconds} s`);

  const src = take(file);
  const len = edit.seconds * SR;
  const out = new Float32Array(len * 2);
  let n0 = 0; // output bar where the segment starts
  edit.bars.forEach(([a, b], k) => {
    const n1 = n0 + b - a;
    const shift = Math.round((edit.take.phase + BAR * (a - n0)) * SR); // source sample = output sample + shift
    const start = k === 0 ? 0 : (BAR * n0 - PRE) * SR;
    const end = k === edit.bars.length - 1 ? len : (BAR * n1 - PRE) * SR;
    const half = (XF / 2) * SR;
    const from = Math.max(0, Math.floor(start - half));
    const to = Math.min(len, Math.ceil(end + half));
    for (let i = from; i < to; i++) {
      // equal-power ramps across each internal seam; hard edges at the file's ends
      const up = k === 0 ? 1 : Math.sin((Math.PI / 2) * Math.min(1, Math.max(0, (i - (start - half)) / (2 * half))));
      const down = k === edit.bars.length - 1 ? 1 : Math.cos((Math.PI / 2) * Math.min(1, Math.max(0, (i - (end - half)) / (2 * half))));
      const j = i + shift;
      if (j < 0 || j * 2 + 1 >= src.length) continue;
      out[i * 2] = out[i * 2]! + src[j * 2]! * up * down;
      out[i * 2 + 1] = out[i * 2 + 1]! + src[j * 2 + 1]! * up * down;
    }
    if (k > 0) console.log(`  seam at ${(BAR * n0).toFixed(1)} s: take bar ${edit.bars[k - 1]![1] - 1} → bar ${a}`);
    n0 = n1;
  });
  // 10 ms fade at the very end
  for (let i = len - 0.01 * SR; i < len; i++) {
    const g = (len - i) / (0.01 * SR);
    out[i * 2] = out[i * 2]! * g;
    out[i * 2 + 1] = out[i * 2 + 1]! * g;
  }
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "f32le", "-ac", "2", "-ar", String(SR), "-i", "-", "-c:a", "pcm_s16le", edit.out], {
    input: Buffer.from(out.buffer),
    maxBuffer: 1 << 30,
  });
  console.log(`${path.basename(file)} → ${edit.out} (${edit.seconds} s, ${edit.bars.length - 1} seams)`);
}

const [which, file] = process.argv.slice(2);
if (which !== "60" && which !== "150") throw new Error("usage: music.ts 60|150 <take.mp3|wav>");
if (!file) throw new Error("usage: music.ts 60|150 <take.mp3|wav>");
render(EDITS[which], file);
