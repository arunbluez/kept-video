/**
 * Acceptance checks — the film's rules, checked mechanically.
 *
 *   pnpm check            # source rules + the render, if out/kept-launch-film.mp4 exists
 *
 * Covers what a machine can decide: timing on the beat grid, super on-screen
 * minimums, the violet budget, the "never" list where it shows up in code,
 * whips, theme swaps, product-contract fidelity, and the rendered file's specs.
 * What only eyes can judge is in REVIEW.md, with the stills that judged it.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { publishResponseSchema, slugSchema } from "@kept/shared";
import { containsProfanity, isReservedSlug } from "@kept/slug";
import { CAMERA_KEYS } from "../src/acts/camera-path";
import { LAPSED_SLUG, ORRERY_NAME, ORRERY_SLUG, RESPONSE, SUPERS, SYNTH_SLUG, VO_LINES, WAY_SLUGS, voSeconds } from "../src/copy";
import { CUT60_FRAMES, PIECES, WIPE } from "../src/cut60";
import { CUES } from "../src/system/cues";
import { themeMix } from "../src/system/theme";
import { DOWNBEAT_OFFSET, DURATION_IN_FRAMES, FPS, FRAMES_PER_BEAT, THEME_SWAPS, WHIPS, at } from "../src/system/timeline";

type Result = { name: string; ok: boolean; detail: string };
const results: Result[] = [];
const check = (name: string, ok: boolean, detail = "") => results.push({ name, ok, detail });

const SRC = path.resolve("src");
const files = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const sources = files(SRC).filter((f) => /\.(ts|tsx)$/.test(f));
const read = (f: string) => fs.readFileSync(f, "utf8");
const rel = (f: string) => path.relative(process.cwd(), f);

/* ── format ─────────────────────────────────────────────────────────── */
check("150 s at 60 fps (9000 frames)", DURATION_IN_FRAMES === 9000 && FPS === 60, `${DURATION_IN_FRAMES} frames`);

/* ── beat grid ──────────────────────────────────────────────────────── */
const atLiterals = sources.flatMap((f) =>
  [...read(f).matchAll(/\bat\((\d+(?:\.\d+)?)\)/g)].map((m) => ({ f: rel(f), sec: Number(m[1]) })),
);
const offGrid = atLiterals.filter((h) => Math.abs(h.sec * 4 - Math.round(h.sec * 4)) > 1e-9);
check("every hit sits on the eighth-note grid", offGrid.length === 0, offGrid.map((h) => `${h.f}: at(${h.sec})`).join(", ") || `${atLiterals.length} hits`);
const eighthOnly = [...new Set(atLiterals.filter((h) => Math.abs(h.sec * 2 - Math.round(h.sec * 2)) > 1e-9).map((h) => h.sec))].sort((a, b) => a - b);
check("hits between beats are deliberate eighths", true, eighthOnly.length ? `on eighths: ${eighthOnly.join(", ")}` : "none");
const cueOff = CUES.filter((c) => !Number.isFinite(c.f) || c.f < 0 || c.f > DURATION_IN_FRAMES);
check("every SFX cue lands inside the film", cueOff.length === 0, `${CUES.length} cues`);

/* ── supers ─────────────────────────────────────────────────────────── */
const EXIT = 0.5; // the exit wipe, one beat
const words = (lines: (string | { t: string })[][]) => lines.flat().filter((w) => (typeof w === "string" ? w : w.t) !== "—").length;
const short: string[] = [];
const superSpans: { id: string; from: number; to: number; need: number }[] = [];
let violetTotal = 0;
const violetTwice: string[] = [];
for (const [id, s] of Object.entries(SUPERS) as [string, { at: number; exit?: number; lines: (string | { t: string; accent?: boolean })[][] }][]) {
  const n = words(s.lines);
  const need = 1.2 + 0.25 * n;
  const shown = (s.exit === undefined ? DURATION_IN_FRAMES / FPS : s.exit + EXIT) - s.at;
  if (shown + 1e-9 < need) short.push(`${id} ${shown.toFixed(2)}s < ${need.toFixed(2)}s`);
  superSpans.push({ id, from: at(s.at), to: s.exit === undefined ? DURATION_IN_FRAMES : at(s.exit + EXIT), need });
  const v = s.lines.flat().filter((w) => typeof w !== "string" && w.accent).length;
  violetTotal += v;
  if (v > 1) violetTwice.push(id);
}
check("supers hold ≥ 1.2 s + 0.25 s per word", short.length === 0, short.join("; ") || `${Object.keys(SUPERS).length} supers`);
check("at most one violet word per super", violetTwice.length === 0, violetTwice.join(", "));
check("at most five violet words in the film", violetTotal <= 5, `${violetTotal} used`);

/* ── the never list, where code can show it ─────────────────────────── */
const allowHex = (f: string) => f.endsWith(path.join("system", "tokens.ts")) || f.includes(`${path.sep}pages${path.sep}`);
const hexHits = sources.filter((f) => !allowHex(f)).flatMap((f) =>
  read(f)
    .split("\n")
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /#[0-9a-fA-F]{3,8}\b/.test(l.replace(/\/\/.*$/, "")) || /rgba?\(/.test(l))
    .map(({ i }) => `${rel(f)}:${i + 1}`),
);
check("no colour literal outside tokens.ts and the sample pages", hexHits.length === 0, hexHits.join(", "));
const banned: [RegExp, string][] = [
  [/(linear|radial|conic)-gradient\(/, "gradient"],
  [/filter:\s*["'`]?blur\(/, "blur filter (glow/bloom)"],
  [/<canvas|WebGL|three/i, "WebGL / canvas 3D"],
];
const bannedHits = sources.flatMap((f) =>
  banned.filter(([re]) => re.test(read(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "").replace(/`<!doctype[\s\S]*?<\/html>`/g, ""))).map(([, what]) => `${rel(f)}: ${what}`),
);
check("no gradients, glows or WebGL", bannedHits.length === 0, bannedHits.join(", "));

/* ── motion language ────────────────────────────────────────────────── */
check("exactly three camera whips (T4)", WHIPS.length === 3, WHIPS.map((w) => `${(w.from / FPS).toFixed(1)}s`).join(", "));
check("whips are the only motion-blurred frames", read(path.join(SRC, "FilmPicture.tsx")).includes("WHIPS.some("), "CameraMotionBlur gated on WHIPS");
check("theme swaps interpolate over ≥ 3 s", THEME_SWAPS.every((s) => s.to - s.from >= 3 * FPS), THEME_SWAPS.map((s) => `${((s.to - s.from) / FPS).toFixed(1)}s`).join(", "));
const scrambleCalls = sources.flatMap((f) => [...read(f).matchAll(/\bscramble\(frame/g)].map(() => rel(f)));
check("scramble-decode only where a URL is born (mint, rename)", scrambleCalls.length === 2, scrambleCalls.join(", "));
const mascots = sources.filter((f) => f.includes(`${path.sep}acts${path.sep}`)).flatMap((f) => [...read(f).matchAll(/<Mascot\b[^>]*>/g)].map((m) => `${rel(f)}${m[0].includes("dim") ? " (dim)" : ""}`));
check("the mascot appears exactly twice: dim, then alive", mascots.length === 2 && mascots.some((m) => m.includes("(dim)")), mascots.join(", "));
const keysSorted = CAMERA_KEYS.every((k, i) => i === 0 || k.f >= CAMERA_KEYS[i - 1]!.f);
const keysFinite = CAMERA_KEYS.every((k) => [k.f, k.x, k.y, k.s].every(Number.isFinite) && k.s > 0 && (k.r ?? 0) === 0);
check("camera keys are ordered, finite, and never roll", keysSorted && keysFinite, `${CAMERA_KEYS.length} keys`);

/* ── product fidelity ───────────────────────────────────────────────── */
const shape = publishResponseSchema.shape as Record<string, unknown>;
const missing = Object.keys(RESPONSE).filter((k) => !(k in shape));
check("agent JSON uses publishResponseSchema's field names", missing.length === 0, missing.join(", ") || Object.keys(RESPONSE).join(", "));
check("the claim token is masked", RESPONSE.claim_url.includes("••••") && !/keep\/[A-Za-z0-9_-]{8,}/.test(RESPONSE.claim_url), RESPONSE.claim_url);
const slugs = [ORRERY_SLUG, SYNTH_SLUG, LAPSED_SLUG, ...WAY_SLUGS];
const badSlugs = slugs.filter((s) => !slugSchema.safeParse(s).success || isReservedSlug(s) || containsProfanity(s));
check("anonymous slugs pass the product's slug rules", badSlugs.length === 0, slugs.join(", "));
check("the rename is a valid slug", slugSchema.safeParse(ORRERY_NAME).success, ORRERY_NAME);
check("first hit after the whip lands on Act 3's downbeat", WHIPS[0]!.to === at(44.0), "");

/* ── the 60 s cut ───────────────────────────────────────────────────── */
check("60 s cut is 60 s", CUT60_FRAMES === 60 * FPS, `${CUT60_FRAMES} frames`);
const BAR = FRAMES_PER_BEAT * 4;
const offBar = PIECES.filter((p) => (p.srcFrom - DOWNBEAT_OFFSET) % BAR !== 0 || (p.srcTo - DOWNBEAT_OFFSET) % BAR !== 0);
check("60 s cut: every piece starts and ends on a bar line", offBar.length === 0, PIECES.map((p) => `${p.srcFrom / FPS}–${p.srcTo / FPS}s`).join(", "));
const whipInCut = PIECES.filter((p) => WHIPS.some((w) => w.from < p.srcTo + WIPE && w.to > p.srcFrom));
check("60 s cut: no whip inside a piece", whipInCut.length === 0, "the cut's clock offset would clamp motion-blur samples");
const flips = PIECES.slice(1).filter((p, i) => Math.abs(themeMix(PIECES[i]!.srcTo - 1) - themeMix(p.srcFrom)) > 0.01);
check("60 s cut: no theme flip across a cut", flips.length === 0, "");
const clipped: string[] = [];
for (const sp of superSpans) {
  for (const p of PIECES) {
    const seen = Math.min(sp.to, p.srcTo) - Math.max(sp.from, p.srcFrom);
    if (seen > 0 && seen / FPS + 1e-9 < sp.need) clipped.push(`${sp.id} ${(seen / FPS).toFixed(2)}s < ${sp.need.toFixed(2)}s`);
  }
}
check("60 s cut: every super it shows holds its minimum", clipped.length === 0, clipped.join("; "));
const vo = [...VO_LINES].sort((a, b) => a.at - b.at);
const voBad = vo.filter((l, i) => l.at < 0 || l.at + voSeconds(l.text) > CUT60_FRAMES / FPS || (i > 0 && vo[i - 1]!.at + voSeconds(vo[i - 1]!.text) > l.at));
check("60 s cut: VO lines fit and never overlap", voBad.length === 0, voBad.map((l) => l.id).join(", ") || `${vo.length} lines`);

/* ── the renders ────────────────────────────────────────────────────── */
function checkRender(label: string, file: string, seconds: number) {
  if (!fs.existsSync(file)) {
    check(`${label}: present`, false, `${rel(file)} not found`);
    return;
  }
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" })) as {
    streams: { codec_type: string; codec_name: string; width?: number; height?: number; r_frame_rate?: string; sample_rate?: string; pix_fmt?: string; nb_frames?: string; duration?: string }[];
    format: { duration: string; size: string };
  };
  const v = probe.streams.find((x) => x.codec_type === "video");
  const a = probe.streams.find((x) => x.codec_type === "audio");
  check(`${label}: H.264 1920×1080 yuv420p`, v?.codec_name === "h264" && v.width === 1920 && v.height === 1080 && v.pix_fmt === "yuv420p", `${v?.codec_name} ${v?.width}×${v?.height} ${v?.pix_fmt}`);
  check(`${label}: 60 fps`, v?.r_frame_rate === "60/1", v?.r_frame_rate ?? "");
  const frames = Number(v?.nb_frames);
  const audioDur = Number(a?.duration);
  check(
    `${label}: ${seconds} s`,
    frames === seconds * FPS && Math.abs(audioDur - seconds) < 0.05,
    `${frames} frames, audio ${audioDur.toFixed(3)} s, ${(Number(probe.format.size) / 1e6).toFixed(1)} MB`,
  );
  check(`${label}: AAC 48 kHz audio`, a?.codec_name === "aac" && a.sample_rate === "48000", `${a?.codec_name} ${a?.sample_rate}`);
  const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" });
  const summary = stderr.slice(stderr.lastIndexOf("Summary"));
  const lufs = Number(/I:\s+(-?\d+(?:\.\d+)?) LUFS/.exec(summary)?.[1]);
  const tp = Number(/Peak:\s+(-?\d+(?:\.\d+)?) dBFS/.exec(summary)?.[1]);
  check(`${label}: −14 LUFS ± 1, true peak ≤ −1 dBTP`, Math.abs(lufs + 14) <= 1 && tp <= -0.9, `${lufs} LUFS, ${tp} dBTP`);
}
checkRender("render 150 s", path.resolve("out/kept-launch-film.mp4"), 150);
checkRender("render 60 s", path.resolve("out/kept-launch-film-60.mp4"), 60);

/* ── report ─────────────────────────────────────────────────────────── */
const width = Math.max(...results.map((r) => r.name.length));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
