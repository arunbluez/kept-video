import React from "react";
import { rng } from "../system/anim";
import type { PageProps } from "./types";

/** `make me a tiny solar system I can spin` — the hero page. Own palette. */
const P = {
  sky: "#0E1330",
  star: "#CFE3FF",
  orbit: "rgba(207,227,255,0.16)",
  sunCore: "#FFD166",
  sun: "#FFB627",
  ink: "#E8EEFF",
  dim: "#8C97C4",
  chip: "#1B2350",
};

const PLANETS = [
  { r: 110, period: 1.6, size: 9, color: "#A9B8CF" },
  { r: 160, period: 2.6, size: 15, color: "#F4A259" },
  { r: 222, period: 4.0, size: 17, color: "#4EA8DE", moon: true },
  { r: 290, period: 6.2, size: 13, color: "#E76F51" },
  { r: 372, period: 9.4, size: 34, color: "#E9C46A", bands: true },
  { r: 460, period: 13.6, size: 26, color: "#84DCC6", ring: true },
];

const STARS = (() => {
  const r = rng(7);
  return Array.from({ length: 150 }, () => ({
    x: r() * 1600,
    y: r() * 900,
    s: 0.8 + r() * 2.2,
    o: 0.25 + r() * 0.6,
  }));
})();

const CX = 800;
const CY = 480;
const TILT = 0.42;

export const Orrery: React.FC<PageProps & { spin?: number }> = ({ f, spin = 0 }) => {
  const t = f / 60;
  const bodies = PLANETS.map((p, i) => {
    const a = (t / p.period) * Math.PI * 2 + (spin * Math.PI) / 180 + i * 1.7;
    const x = CX + Math.cos(a) * p.r;
    const y = CY + Math.sin(a) * p.r * TILT;
    const depth = Math.sin(a); // >0: in front of the sun
    return { ...p, a, x, y, depth, k: 1 + depth * 0.12 };
  });
  const planet = (b: (typeof bodies)[number], i: number) => (
    <g key={i}>
      {b.ring ? (
        <ellipse
          cx={b.x}
          cy={b.y}
          rx={b.size * 2 * b.k}
          ry={b.size * 0.55 * b.k}
          fill="none"
          stroke="#CDEFE6"
          strokeWidth={4}
          transform={`rotate(-14 ${b.x} ${b.y})`}
        />
      ) : null}
      <circle cx={b.x} cy={b.y} r={b.size * b.k} fill={b.color} />
      {b.bands ? (
        <>
          <rect x={b.x - b.size * b.k} y={b.y - 6} width={b.size * 2 * b.k} height={5} fill="#C98F3D" opacity={0.7} />
          <rect x={b.x - b.size * b.k} y={b.y + 8} width={b.size * 2 * b.k} height={4} fill="#C98F3D" opacity={0.5} />
        </>
      ) : null}
      {/* night side */}
      <path
        d={`M ${b.x} ${b.y - b.size * b.k} A ${b.size * b.k} ${b.size * b.k} 0 0 ${Math.cos(b.a) > 0 ? 1 : 0} ${b.x} ${b.y + b.size * b.k} Z`}
        fill="#0E1330"
        opacity={0.28}
      />
      {b.moon ? (
        <circle
          cx={b.x + Math.cos(t * 5) * 32}
          cy={b.y + Math.sin(t * 5) * 13}
          r={5}
          fill="#E6E6EA"
        />
      ) : null}
    </g>
  );
  const behind = bodies.filter((b) => b.depth <= 0);
  const front = bodies.filter((b) => b.depth > 0);
  return (
    <div style={{ width: 1600, height: 900, background: P.sky, position: "relative", overflow: "hidden" }}>
      <svg width={1600} height={900} style={{ position: "absolute", inset: 0 }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={P.star} opacity={s.o * (0.75 + 0.25 * Math.sin(t * 2 + i))} />
        ))}
        {PLANETS.map((p, i) => (
          <ellipse key={i} cx={CX} cy={CY} rx={p.r} ry={p.r * TILT} fill="none" stroke={P.orbit} strokeWidth={2} />
        ))}
        {behind.map(planet)}
        <circle cx={CX} cy={CY} r={58} fill={P.sun} />
        <circle cx={CX - 10} cy={CY - 10} r={38} fill={P.sunCore} />
        {front.map(planet)}
      </svg>
      <div style={{ position: "absolute", left: 64, top: 52, fontFamily: "Inter", color: P.ink }}>
        <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.02em" }}>orrery</div>
        <div style={{ fontSize: 22, color: P.dim, marginTop: 6 }}>drag to spin · one year ≈ four seconds</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 52,
          display: "flex",
          gap: 12,
          fontFamily: "'JetBrains Mono'",
          fontSize: 20,
          color: P.ink,
        }}
      >
        {["1×", "2×", "8×"].map((s, i) => (
          <span
            key={s}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              background: i === 0 ? "#FFB627" : P.chip,
              color: i === 0 ? P.sky : P.ink,
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <div
        style={{ position: "absolute", left: 64, bottom: 56, fontFamily: "'JetBrains Mono'", fontSize: 20, color: P.dim }}
      >
        DAY {String(1204 + Math.floor(t * 91)).padStart(5, "0")}
      </div>
    </div>
  );
};

/** The page's actual source, streamed in Act 0 (0:04.0). */
export const ORRERY_SOURCE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>orrery</title>
<style>
  html,body{margin:0;height:100%;background:#0e1330;color:#e8eeff;font:16px Inter,system-ui}
  canvas{display:block;width:100vw;height:100vh;cursor:grab}
  h1{position:fixed;left:32px;top:24px;margin:0;font-weight:600}
  .speed{position:fixed;right:32px;bottom:24px;display:flex;gap:8px}
  .speed button{border:0;border-radius:999px;padding:6px 12px;background:#1b2350;color:inherit}
  .speed button.on{background:#ffb627;color:#0e1330}
</style>
</head>
<body>
<h1>orrery</h1>
<div class="speed"><button class="on">1×</button><button>2×</button><button>8×</button></div>
<canvas id="sky"></canvas>
<script>
const planets = [
  { r: 110, period: 1.6, size: 9,  color: "#a9b8cf" },
  { r: 160, period: 2.6, size: 15, color: "#f4a259" },
  { r: 222, period: 4.0, size: 17, color: "#4ea8de", moon: true },
  { r: 290, period: 6.2, size: 13, color: "#e76f51" },
  { r: 372, period: 9.4, size: 34, color: "#e9c46a" },
  { r: 460, period: 13.6, size: 26, color: "#84dcc6", ring: true },
];
const cv = document.getElementById("sky"), cx = cv.getContext("2d");
let spin = 0, speed = 1, drag = null, t0 = performance.now();
const fit = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
addEventListener("resize", fit); fit();
cv.addEventListener("pointerdown", e => { drag = e.clientX; cv.style.cursor = "grabbing"; });
addEventListener("pointerup", () => { drag = null; cv.style.cursor = "grab"; });
addEventListener("pointermove", e => { if (drag !== null) { spin += (e.clientX - drag) * 0.4; drag = e.clientX; } });
document.querySelectorAll(".speed button").forEach((b, i) => b.onclick = () => {
  speed = [1, 2, 8][i];
  document.querySelectorAll(".speed button").forEach(x => x.classList.toggle("on", x === b));
});
function frame(now) {
  const t = (now - t0) / 1000 * speed, w = cv.width, h = cv.height, k = devicePixelRatio;
  cx.clearRect(0, 0, w, h);
  const ox = w / 2, oy = h / 2 + 20 * k;
  const bodies = planets.map((p, i) => {
    const a = t / p.period * Math.PI * 2 + spin * Math.PI / 180 + i * 1.7;
    return { ...p, x: ox + Math.cos(a) * p.r * k, y: oy + Math.sin(a) * p.r * .42 * k, z: Math.sin(a) };
  });
  cx.strokeStyle = "rgba(207,227,255,.16)";
  planets.forEach(p => { cx.beginPath(); cx.ellipse(ox, oy, p.r * k, p.r * .42 * k, 0, 0, 7); cx.stroke(); });
  const draw = b => { cx.fillStyle = b.color; cx.beginPath(); cx.arc(b.x, b.y, b.size * k * (1 + b.z * .12), 0, 7); cx.fill(); };
  bodies.filter(b => b.z <= 0).forEach(draw);
  cx.fillStyle = "#ffb627"; cx.beginPath(); cx.arc(ox, oy, 58 * k, 0, 7); cx.fill();
  bodies.filter(b => b.z > 0).forEach(draw);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
</script>
</body>
</html>`;
