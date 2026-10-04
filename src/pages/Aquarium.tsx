import React from "react";
import { rng } from "../system/anim";
import { PixelCanvas, push, stamp, type Sprite } from "./pixel";
import type { PageProps } from "./types";

/** `a pixel aquarium` — 160×90 pixels at 10px. Own palette. */
const COLS = 160;
const ROWS = 90;

const WATER = ["#0B3D5C", "#0E4A6E", "#115A82", "#156B96", "#1A7DAA"];
const SAND = ["#E9C891", "#D9B276"];

const FISH: Sprite = [
  "   oo    ",
  "  oooo o ",
  " owoooooo",
  "ookoooo o",
  " oooooo  ",
  "  oooo   ",
];
const SMALL: Sprite = [" yy  ", "yyyyy", "ykyy ", " yy  "];

const FISHES: { y: number; speed: number; phase: number; sprite: Sprite; pal: Record<string, string> }[] = [
  { y: 26, speed: 9, phase: 0, sprite: FISH, pal: { o: "#FF7A59", w: "#FFFFFF", k: "#1B1B2F" } },
  { y: 44, speed: -6, phase: 40, sprite: FISH, pal: { o: "#FFD166", w: "#FFFFFF", k: "#1B1B2F" } },
  { y: 58, speed: 12, phase: 90, sprite: SMALL, pal: { y: "#9BF6FF", k: "#1B1B2F" } },
  { y: 34, speed: -10, phase: 120, sprite: SMALL, pal: { y: "#FFADAD", k: "#1B1B2F" } },
  { y: 66, speed: 5, phase: 20, sprite: FISH, pal: { o: "#CDB4DB", w: "#FFFFFF", k: "#1B1B2F" } },
];

const BUBBLES = (() => {
  const r = rng(3);
  return Array.from({ length: 14 }, () => ({ x: 8 + r() * 144, speed: 6 + r() * 8, phase: r() * 90 }));
})();

const WEEDS = [18, 24, 61, 66, 112, 118, 140];

export const Aquarium: React.FC<PageProps> = ({ f }) => {
  const t = f / 60;
  const b = new Map<string, string[]>();
  WATER.forEach((c, i) => push(b, c, 0, i * 16, COLS, 16));
  push(b, SAND[0]!, 0, 80, COLS, 10);
  for (let x = 0; x < COLS; x += 7) push(b, SAND[1]!, x + ((x * 3) % 5), 82 + (x % 3), 2, 1);
  WEEDS.forEach((wx, i) => {
    const h = 14 + (i % 3) * 6;
    for (let y = 0; y < h; y++) {
      const sway = Math.round(Math.sin(t * 1.6 + i + y * 0.25) * (y / h) * 2.2);
      push(b, y % 2 ? "#2A9D8F" : "#3BB89F", wx + sway, 80 - y, 2, 1);
    }
  });
  BUBBLES.forEach((bu) => {
    const y = 80 - ((t * bu.speed + bu.phase) % 82);
    const x = bu.x + Math.round(Math.sin(t * 2 + bu.phase) * 1.5);
    push(b, "#BDEBFF", x, Math.round(y), 1, 1);
  });
  FISHES.forEach((fi) => {
    const span = COLS + 24;
    const d = (t * Math.abs(fi.speed) + fi.phase) % span;
    const x = fi.speed > 0 ? d - 12 : span - 12 - d;
    const y = fi.y + Math.round(Math.sin(t * 2.4 + fi.phase) * 1.4);
    stamp(b, fi.sprite, fi.pal, x, y, fi.speed < 0);
  });
  return (
    <div style={{ width: 1600, height: 900, position: "relative", overflow: "hidden", background: WATER[0] }}>
      <PixelCanvas buckets={b} cols={COLS} rows={ROWS} cell={10} />
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 32,
          fontFamily: "'JetBrains Mono'",
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.1em",
          color: "#BDEBFF",
        }}
      >
        PIXEL AQUARIUM <span style={{ color: "#FFD166" }}>· 5 FISH</span>
      </div>
    </div>
  );
};
