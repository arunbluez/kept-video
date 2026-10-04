import React from "react";
import { DOWNBEAT_OFFSET, FRAMES_PER_BEAT } from "../system/timeline";
import { PixelCanvas, push, stamp, type Sprite } from "./pixel";
import type { PageProps } from "./types";

/** `a platformer with one button` — 160×90 pixels at 10px. Own palette. */
const COLS = 160;
const ROWS = 90;
const SKY = ["#FFB4A2", "#FFC8B4", "#FFD9C4", "#FFE8D6"];
const HILL = "#E5989B";
const HILL_FAR = "#F2B5B0";
const GROUND = "#6D597A";
const GROUND_TOP = "#B56576";

const HERO: Sprite = [" hhhh ", "hhhhhh", "hwkhwk", "hhhhhh", "hhhhhh", " h  h "];
const SPIKE: Sprite = ["  s  ", " sss ", "sssss"];
const COIN: Sprite = [" c ", "ccc", " c "];

const GROUND_Y = 72;
const HERO_X = 34;

export const Platformer: React.FC<PageProps> = ({ f }) => {
  const t = f / 60;
  // Everything runs on the beat grid: 24px of world per beat, a spike every
  // two beats, and a jump on every other beat that peaks right over it.
  const beatPos = (f - DOWNBEAT_OFFSET) / FRAMES_PER_BEAT;
  const scroll = beatPos * 24;
  const b = new Map<string, string[]>();
  SKY.forEach((c, i) => push(b, c, 0, i * 12, COLS, 12));
  push(b, SKY[3]!, 0, 48, COLS, 24);
  // far and near hills, parallax
  for (let x = 0; x < COLS; x++) {
    const far = Math.round(10 + Math.sin((x + scroll * 0.2) / 13) * 5);
    push(b, HILL_FAR, x, GROUND_Y - far - 6, 1, far + 6);
    const near = Math.round(6 + Math.sin((x + scroll * 0.5) / 9 + 1) * 4);
    push(b, HILL, x, GROUND_Y - near, 1, near);
  }
  push(b, GROUND, 0, GROUND_Y, COLS, ROWS - GROUND_Y);
  push(b, GROUND_TOP, 0, GROUND_Y, COLS, 2);
  for (let x = -(scroll % 8); x < COLS; x += 8) push(b, "#5A4766", Math.round(x), GROUND_Y + 5, 3, 1);

  const spacing = 48;
  for (let wx = Math.floor((scroll - 52) / spacing) * spacing; wx < scroll + COLS; wx += spacing) {
    if (wx < spacing) continue;
    const sx = wx - scroll + 47;
    stamp(b, SPIKE, { s: "#355070" }, sx, GROUND_Y - 3);
    const bob = Math.round(Math.sin(t * 4 + wx) * 1);
    stamp(b, COIN, { c: "#FFD166" }, sx + 1, GROUND_Y - 22 + bob);
  }

  // one button: a one-beat parabola starting on each even beat
  const u = ((beatPos % 2) + 2) % 2;
  const jump = u < 1 ? Math.round(4 * u * (1 - u) * 22) : 0;
  stamp(b, HERO, { h: "#355070", w: "#FFFFFF", k: "#1B1B2F" }, HERO_X, GROUND_Y - 6 - jump);

  const score = Math.floor(scroll / spacing) * 10;
  return (
    <div style={{ width: 1600, height: 900, position: "relative", overflow: "hidden", background: SKY[0] }}>
      <PixelCanvas buckets={b} cols={COLS} rows={ROWS} cell={10} />
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 30,
          right: 40,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'JetBrains Mono'",
          fontWeight: 600,
          fontSize: 32,
          letterSpacing: "0.08em",
          color: "#355070",
        }}
      >
        <span>SCORE {String(score).padStart(5, "0")}</span>
        <span style={{ opacity: Math.floor(t * 2) % 2 ? 0.35 : 1 }}>PRESS SPACE</span>
      </div>
    </div>
  );
};
