import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../system/anim";
import { useCam } from "../system/camera";
import { useTheme } from "../system/theme";
import { ms } from "../system/timeline";
import { EASE } from "../system/tokens";

/** Column pitch: 12 columns to a 1920 cell, continuous across the world. */
const PITCH = 160;
const DRAW_ORIGIN = { x: 960, y: 540 };

/**
 * kept's faint column grid, drawn only where the camera can see it. In the
 * opening it draws outward from the centre: each line 400 ms, 40 ms stagger,
 * 35% opacity (brief §7, 0:00.0).
 */
export const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = useCam();
  const { c } = useTheme();
  const halfW = 960 / cam.s + PITCH;
  const halfH = 540 / cam.s + PITCH;
  const x0 = Math.floor((cam.x - halfW) / PITCH) * PITCH;
  const x1 = cam.x + halfW;
  const y0 = cam.y - halfH;
  const y1 = cam.y + halfH;

  const lines: React.ReactNode[] = [];
  for (let x = x0; x <= x1; x += PITCH) {
    const rank = Math.round(Math.abs(x - DRAW_ORIGIN.x) / PITCH);
    const p = prog(frame, ms(40 * rank), ms(400), EASE.out);
    if (p <= 0) continue;
    // Lines grow from the vertical centre of the opening frame, then fill the view.
    const top = p >= 1 ? y0 : DRAW_ORIGIN.y - 540 * p;
    const bottom = p >= 1 ? y1 : DRAW_ORIGIN.y + 540 * p;
    lines.push(
      <line
        key={x}
        x1={x}
        x2={x}
        y1={top}
        y2={bottom}
        stroke={c.border}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />,
    );
  }

  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 0.35 }}
      width={1}
      height={1}
    >
      {lines}
    </svg>
  );
};
