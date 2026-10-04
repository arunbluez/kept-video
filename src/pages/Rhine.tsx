import React from "react";
import { rng } from "../system/anim";
import type { PageProps } from "./types";

/** `a river-level tracker for the Rhine` — a dashboard. Own palette. */
const P = {
  bg: "#E8F3F1",
  card: "#FFFFFF",
  ink: "#0D3B4C",
  sub: "#5C7D88",
  line: "#1A9E8F",
  fill: "#BFE3DC",
  grid: "#D5E7E3",
  warn: "#F2A541",
};

// 60 days of a plausible gauge reading, metres. Seeded, so it never changes.
const SERIES = (() => {
  const r = rng(42);
  let v = 2.4;
  return Array.from({ length: 60 }, (_, i) => {
    v += (r() - 0.52) * 0.12 + Math.sin(i / 7) * 0.025;
    v = Math.min(3.6, Math.max(1.2, v));
    return v;
  });
})();

const CH = { x: 64, y: 300, w: 1000, h: 470 };
const toY = (v: number) => CH.y + CH.h - ((v - 1) / 3) * CH.h;

export const Rhine: React.FC<PageProps> = ({ f }) => {
  const t = f / 60;
  // the line draws in on first sight, then the last point breathes
  const shown = Math.min(SERIES.length, 8 + Math.floor(t * 30));
  const pts = SERIES.slice(0, shown).map((v, i) => [CH.x + (i / (SERIES.length - 1)) * CH.w, toY(v)] as const);
  const last = pts[pts.length - 1]!;
  const now = SERIES[shown - 1]!;
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${last[0].toFixed(1)},${CH.y + CH.h} L${CH.x},${CH.y + CH.h} Z`;
  const pulse = (t * 1.2) % 1;
  return (
    <div style={{ width: 1600, height: 900, background: P.bg, position: "relative", overflow: "hidden", fontFamily: "Inter", color: P.ink }}>
      <div style={{ position: "absolute", left: 64, top: 56 }}>
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, letterSpacing: "0.12em", color: P.sub }}>RHEIN · PEGEL KAUB</div>
        <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 8 }}>Is the Rhine high today?</div>
      </div>
      <div style={{ position: "absolute", left: 64, top: 200, display: "flex", gap: 18 }}>
        {["60 DAYS", "7 DAYS", "24 H"].map((l, i) => (
          <span
            key={l}
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 18,
              padding: "10px 16px",
              borderRadius: 10,
              background: i === 0 ? P.ink : P.card,
              color: i === 0 ? P.card : P.sub,
            }}
          >
            {l}
          </span>
        ))}
      </div>
      <svg width={1600} height={900} style={{ position: "absolute", inset: 0 }}>
        {[1.5, 2, 2.5, 3, 3.5].map((v) => (
          <g key={v}>
            <line x1={CH.x} x2={CH.x + CH.w} y1={toY(v)} y2={toY(v)} stroke={P.grid} strokeWidth={2} />
            <text x={CH.x + CH.w + 14} y={toY(v) + 6} fontFamily="JetBrains Mono" fontSize={17} fill={P.sub}>
              {v.toFixed(1)} m
            </text>
          </g>
        ))}
        <line x1={CH.x} x2={CH.x + CH.w} y1={toY(3.2)} y2={toY(3.2)} stroke={P.warn} strokeWidth={3} strokeDasharray="10 8" />
        <path d={area} fill={P.fill} opacity={0.7} />
        <path d={path} fill="none" stroke={P.line} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r={10 + pulse * 22} fill={P.line} opacity={(1 - pulse) * 0.35} />
        <circle cx={last[0]} cy={last[1]} r={10} fill={P.line} />
      </svg>
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 300,
          width: 360,
          padding: 36,
          borderRadius: 24,
          background: P.card,
        }}
      >
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, letterSpacing: "0.1em", color: P.sub }}>NOW</div>
        <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 }}>
          {now.toFixed(2)}
          <span style={{ fontSize: 40, color: P.sub }}> m</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 24, color: P.sub }}>−4 cm in 24 h</div>
        <div
          style={{
            marginTop: 28,
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: 10,
            background: P.fill,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          Barges sailing normally
        </div>
      </div>
    </div>
  );
};
