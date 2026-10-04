/**
 * Render stills at shot-list times and tile them into a contact sheet.
 *
 *   pnpm tsx scripts/stills.ts 0.5 2.5 4.8          # seconds
 *   pnpm tsx scripts/stills.ts --act 2              # the act's own beats
 *   pnpm tsx scripts/stills.ts --sheet              # one still per bar → contact sheet
 *
 * Bundles once and reuses the browser, so a dozen stills cost one bundle. The
 * webpack overrides (aliases) come from remotion.config.ts.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { actFrom, actTo, at, FPS } from "../src/system/timeline";
import { webpackOverride } from "../webpack-override";

const args = process.argv.slice(2);
// Each run writes to its own folder, so old stills never mix into a new tile.
const outDir = path.resolve("out/stills", new Date().toISOString().replace(/[:.]/g, "-"));
fs.mkdirSync(outDir, { recursive: true });

let times: number[] = [];
let sheet = false;
if (args[0] === "--act") {
  const id = Number(args[1]);
  const from = actFrom(id) / FPS;
  const to = actTo(id) / FPS;
  for (let t = from + 0.75; t < to; t += 1.5) times.push(Number(t.toFixed(2)));
} else if (args[0] === "--sheet") {
  sheet = true;
  for (let bar = 0; bar < 75; bar++) times.push(bar * 2 + 1);
} else {
  times = args.map(Number);
}

const browserExecutable =
  process.env.REMOTION_BROWSER_EXECUTABLE ??
  (process.env.PLAYWRIGHT_BROWSERS_PATH
    ? path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium_headless_shell-1194/chrome-linux/headless_shell")
    : null);

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: "KeptFilm", puppeteerInstance: browser });
const files: string[] = [];
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, at(t));
  const file = path.join(outDir, `${sheet ? "sheet-" : ""}${t.toFixed(2).padStart(6, "0")}.png`);
  await renderStill({ composition, serveUrl, frame, output: file, puppeteerInstance: browser, scale: sheet ? 0.25 : 0.5 });
  files.push(file);
  console.log(`${t.toFixed(2)}s → ${path.relative(process.cwd(), file)}`);
}
await browser.close({ silent: true });

if (!sheet && files.length > 1) tile(files, Math.min(4, files.length), path.resolve("out/tile.png"), 960, 540);
// 75 bars → a 5 × 15 grid, chapter by chapter
if (sheet) tile(files, 5, path.resolve("out/contact-sheet.png"), 384, 216);

/** Lay stills out in a grid with xstack (explicit layout, every input placed). */
function tile(inputs: string[], cols: number, out: string, w: number, h: number) {
  const pad = 8;
  const layout = inputs.map((_, i) => `${(i % cols) * (w + pad)}_${Math.floor(i / cols) * (h + pad)}`).join("|");
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error",
    ...inputs.flatMap((f) => ["-i", f]),
    "-filter_complex", `${inputs.map((_, i) => `[${i}:v]scale=${w}:${h}[v${i}]`).join(";")};${inputs.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${inputs.length}:layout=${layout}:fill=0xE5E0D8`,
    "-frames:v", "1", out,
  ]);
  console.log(`review tile → ${path.relative(process.cwd(), out)}`);
}

