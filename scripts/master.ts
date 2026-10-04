/**
 * Master the render's audio: two-pass EBU R128 loudness normalisation to
 * −14 LUFS integrated, ≤ −1 dBTP — the usual target for web video — with the
 * picture stream copied untouched.
 *
 *   tsx scripts/master.ts out/kept-launch-film.raw.mp4 out/kept-launch-film.mp4
 */
import { execFileSync, spawnSync } from "node:child_process";

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error("usage: master.ts <in.mp4> <out.mp4>");

// −1.5 dBTP into the encoder leaves room for AAC's inter-sample overshoot
const TARGET = "I=-14:TP=-1.5:LRA=11";
// pass 1: measure (ffmpeg prints the loudnorm report on stderr)
const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", input, "-af", `loudnorm=${TARGET}:print_format=json`, "-f", "null", "-"], {
  encoding: "utf8",
});
const m = JSON.parse(stderr.slice(stderr.lastIndexOf("{"), stderr.lastIndexOf("}") + 1)) as Record<string, string>;
// pass 2: apply, linear, with the measurements
const second = `loudnorm=${TARGET}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", input, "-c:v", "copy", "-af", second, "-ar", "48000", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", output]);
console.log(`mastered → ${output} (measured ${m.input_i} LUFS → −14 LUFS)`);
