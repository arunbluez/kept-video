import React from "react";
import { rng } from "../system/anim";
import type { PageProps } from "./types";

/** `a calm pomodoro timer` — a tool. Own palette. */
export const Pomodoro: React.FC<PageProps> = ({ f }) => {
  const t = f / 60;
  const total = 25 * 60;
  const left = total - 1 - (Math.floor(t * 7) % total);
  const p = 1 - left / total;
  const R = 250;
  const C = 2 * Math.PI * R;
  return (
    <div style={{ width: 1600, height: 900, background: "#FFF1E6", position: "relative", fontFamily: "Inter", color: "#5B1F1F" }}>
      <svg width={1600} height={900} style={{ position: "absolute", inset: 0 }}>
        <circle cx={800} cy={450} r={R} fill="none" stroke="#FAD2C1" strokeWidth={36} />
        <circle
          cx={800}
          cy={450}
          r={R}
          fill="none"
          stroke="#E85D48"
          strokeWidth={36}
          strokeLinecap="round"
          strokeDasharray={`${C * p} ${C}`}
          transform="rotate(-90 800 450)"
        />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
        <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>
          {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 22, letterSpacing: "0.14em", color: "#C2654E" }}>FOCUS · 2 OF 4</div>
      </div>
      <div style={{ position: "absolute", left: 64, top: 56, fontSize: 40, fontWeight: 600 }}>tomato</div>
    </div>
  );
};

/** `a type specimen for my favourite font` — a poster. Own palette. */
export const Specimen: React.FC<PageProps> = ({ f }) => {
  const t = f / 60;
  const w = 500 + Math.round(((Math.sin(t * 1.3) + 1) / 2) * 2) * 100;
  return (
    <div style={{ width: 1600, height: 900, background: "#1E3A8A", position: "relative", overflow: "hidden", fontFamily: "Geist", color: "#FDE68A" }}>
      <div style={{ position: "absolute", left: 70, top: 20, fontSize: 560, fontWeight: w, letterSpacing: "-0.06em", lineHeight: 1 }}>Aa</div>
      <div style={{ position: "absolute", right: 80, top: 90, width: 520, fontSize: 40, lineHeight: 1.3, color: "#DBEAFE" }}>
        The quick brown fox jumps over the lazy dog.
      </div>
      <div style={{ position: "absolute", right: 80, bottom: 80, fontFamily: "'JetBrains Mono'", fontSize: 24, letterSpacing: "0.1em", color: "#93C5FD" }}>
        WEIGHT {w} · 500—700
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 150, height: 6, borderRadius: 3, background: "#3B5BB5" }}>
        <div style={{ position: "absolute", left: `${((w - 500) / 200) * 100}%`, top: -15, width: 36, height: 36, borderRadius: 18, background: "#FDE68A" }} />
      </div>
    </div>
  );
};

/**
 * Truchet tiles — the wall's "image" block. A generated artwork rather than a
 * picture: the film uses no stock imagery and no photographs (brief §4.6).
 */
const TILES = (() => {
  const r = rng(11);
  return Array.from({ length: 16 * 9 }, () => ({ flip: r() > 0.5, hue: Math.floor(r() * 3) }));
})();
const TILE_INK = ["#F94144", "#F9C74F", "#43AA8B"];

export const Tiles: React.FC<PageProps> = ({ f }) => {
  const t = f / 60;
  const wave = Math.floor(t * 3);
  return (
    <div style={{ width: 1600, height: 900, background: "#FFF8E7", position: "relative", overflow: "hidden" }}>
      <svg width={1600} height={900} style={{ position: "absolute", inset: 0 }}>
        {TILES.map((tile, i) => {
          const x = (i % 16) * 100;
          const y = Math.floor(i / 16) * 100;
          const flip = tile.flip !== ((i + wave) % 23 === 0);
          const c = TILE_INK[tile.hue]!;
          return (
            <g key={i} transform={`translate(${x} ${y}) ${flip ? "rotate(90 50 50)" : ""}`}>
              <path d="M0 50 A50 50 0 0 0 50 0" fill="none" stroke={c} strokeWidth={14} />
              <path d="M50 100 A50 50 0 0 1 100 50" fill="none" stroke={c} strokeWidth={14} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
