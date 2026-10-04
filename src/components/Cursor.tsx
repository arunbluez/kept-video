import React from "react";
import { useCam } from "../system/camera";
import { useTheme } from "../system/theme";

/**
 * The viewer's hand (brief §3.5): one plain ink cursor. Lives in world space so
 * it can carry things, but is counter-scaled so it reads the same size at any
 * camera zoom. `press` 0→1 dips it, the way a click feels.
 */
export const Cursor: React.FC<{
  x: number;
  y: number;
  press?: number;
  opacity?: number;
  /** Extra screen-space scale, e.g. a slight grow while carrying. */
  scale?: number;
}> = ({ x, y, press = 0, opacity = 1, scale = 1 }) => {
  const cam = useCam();
  const { c } = useTheme();
  if (opacity <= 0) return null;
  const k = (1 / cam.s) * scale * (1 - press * 0.12);
  return (
    <svg
      width={44}
      height={56}
      viewBox="0 0 22 28"
      style={{
        position: "absolute",
        left: x,
        top: y,
        overflow: "visible",
        transformOrigin: "0 0",
        transform: `scale(${k})`,
        opacity,
        zIndex: 1000,
      }}
    >
      <path
        d="M1.2 1.2 L1.2 22.4 L6.4 17.6 L9.8 25.6 L13.4 24.1 L10.1 16.3 L17.2 16.3 Z"
        fill={c.text}
        stroke={c.bg}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
};
