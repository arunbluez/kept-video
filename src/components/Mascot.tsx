import React from "react";
import {
  type HeadGaze,
  KEPT_REST_GAZE,
  MASCOT_REST_T,
  MASCOT_VIEWBOX,
  gazeToward,
  mascotFrame,
} from "@kept/shared/mascot";
import { useTheme } from "../system/theme";
import { FPS } from "../system/timeline";

const [MX, MY, MW, MH] = MASCOT_VIEWBOX.split(" ");

/** The product's gaze smoothing constant (`components/kept/mascot.tsx`). */
const MASCOT_GAZE_K = 6;

/**
 * Integrate the product's exponential gaze follow deterministically: the same
 * step `startMascotLoop` takes per animation frame, taken per film frame from
 * rest. `aim(frame)` returns the normalised pointer offset, or null for rest.
 */
export function smoothedGaze(
  frame: number,
  startFrame: number,
  aim: (f: number) => { nx: number; ny: number } | null,
): HeadGaze {
  let gaze = KEPT_REST_GAZE;
  const step = 1 - Math.exp(-MASCOT_GAZE_K / FPS);
  for (let f = startFrame; f <= frame; f++) {
    const a = aim(f);
    const target = a ? gazeToward(a.nx, a.ny) : KEPT_REST_GAZE;
    gaze = {
      yaw: gaze.yaw + (target.yaw - gaze.yaw) * step,
      pitch: gaze.pitch + (target.pitch - gaze.pitch) * step,
      roll: target.roll,
    };
  }
  return gaze;
}

/**
 * The kept mascot, generated per frame by the product's own generator
 * (`@kept/shared/mascot`, via the pinned `kept/` submodule) — the film draws no
 * mascot of its own. Body in `--accent`, eyes punched through in `--bg`,
 * depth by `drop-shadow` (never box-shadow). `dim` is the edge's expired-page
 * treatment: `grayscale(0.5) opacity(0.5)`.
 */
export const Mascot: React.FC<{
  /** Seconds of the character's own life; 0 is the product's rest instant. */
  t: number;
  size: number;
  gaze?: HeadGaze;
  dim?: boolean;
  id: string;
  style?: React.CSSProperties;
}> = ({ t, size, gaze, dim, id, style }) => {
  const { c, shadow } = useTheme();
  const { d, eyes } = mascotFrame(MASCOT_REST_T + t, { maskId: id, gaze });
  // The product's shadow is tuned at 96–170px; scale it with the character.
  const k = size / 170;
  const filter = [`drop-shadow(${shadow("mascot", k)})`, dim ? "grayscale(0.5) opacity(0.5)" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <svg
      viewBox={MASCOT_VIEWBOX}
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible", filter, ...style }}
      aria-hidden
    >
      <mask id={id} maskUnits="userSpaceOnUse" x={MX} y={MY} width={MW} height={MH}>
        <path d={d} fill="white" />
      </mask>
      <path d={d} fill={c.accent} />
      <g mask={`url(#${id})`} fill={c.bg}>
        {eyes.map((e, i) => (
          <path key={i} d={e.d} transform={e.transform} />
        ))}
      </g>
    </svg>
  );
};
