import React from "react";
import { lerp, prog } from "../system/anim";
import { useTheme } from "../system/theme";
import { ms } from "../system/timeline";
import { EASE, HAIRLINE, RF } from "../system/tokens";
import { BAR_H, BrowserFrame } from "./Frame";

/**
 * T3, link → page: a link pill widens into the address bar of a kept-styled
 * frame, the frame's body draws down from it, and the page blooms out of the
 * live dot (circular reveal, 700 ms ease-out). Used for the orrery (0:31.0)
 * and the pocket synth (1:02.0).
 */
export const Opening: React.FC<{
  frame: number;
  openAt: number;
  /** The pill being opened, centre and width (height 100). */
  pill: { cx: number; cy: number; w: number };
  frameRect: { x: number; y: number; w: number; pageH: number };
  host: React.ReactNode;
  hostSize?: number;
  children: React.ReactNode;
}> = ({ frame, openAt, pill, frameRect, host, hostSize = 30, children }) => {
  const { c } = useTheme();
  if (frame < openAt) return null;
  const m = prog(frame, openAt, ms(500), EASE.camera);
  const hostOn = prog(frame, openAt + ms(120), ms(200));
  const dots = (
    <span style={{ display: "flex", gap: 10, opacity: hostOn }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c.border }} />
      ))}
    </span>
  );

  if (m < 1) {
    return (
      <div
        style={{
          position: "absolute",
          left: lerp(pill.cx - pill.w / 2, frameRect.x, m),
          top: lerp(pill.cy - 50, frameRect.y, m),
          width: lerp(pill.w, frameRect.w, m),
          height: lerp(100, BAR_H, m),
          borderRadius: lerp(50, RF.lg, m),
          background: c.surfaceSunken,
          border: `${HAIRLINE}px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 28,
          gap: 24,
          boxSizing: "border-box",
        }}
      >
        {dots}
        <span style={{ opacity: hostOn, display: "flex", alignItems: "center", fontSize: hostSize }}>{host}</span>
      </div>
    );
  }

  const body = prog(frame, openAt + ms(400), ms(500), EASE.out);
  const bloom = prog(frame, openAt + ms(500), ms(700), EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: frameRect.x,
        top: frameRect.y,
        width: frameRect.w,
        height: lerp(BAR_H, BAR_H + frameRect.pageH, body),
        overflow: "hidden",
        borderRadius: RF.lg,
      }}
    >
      <BrowserFrame w={frameRect.w} pageH={frameRect.pageH} hostSize={hostSize} host={host}>
        {/* the bloom grows from the live dot, just above the page's top-left */}
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${bloom * 2000}px at 180px -36px)` }}>
          {children}
        </div>
      </BrowserFrame>
    </div>
  );
};
