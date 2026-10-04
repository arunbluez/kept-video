import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../system/anim";
import { useTheme } from "../system/theme";
import { chapterAt, FPS, HUD_HIDDEN, ms } from "../system/timeline";
import { FONT, MONO_TRACKING, TYPE } from "../system/tokens";

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

/** mm:ss:ff at 60 fps. */
export const timecode = (frame: number): string => {
  const f = Math.floor(frame);
  return `${pad(f / (FPS * 60))}:${pad((f / FPS) % 60)}:${pad(f % FPS)}`;
};

/**
 * Editorial meta (brief §5.4): chapter top-left, running timecode top-right,
 * mono 20px `--text-muted`, 48px margins. Hides while a page fills the frame
 * and through the finale.
 */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { c } = useTheme();
  let visible = prog(frame, 0, ms(500));
  for (const w of HUD_HIDDEN) {
    const hide = prog(frame, w.from, ms(240)) * (1 - prog(frame, w.to, ms(400)));
    visible *= 1 - hide;
  }
  if (visible <= 0) return null;
  const style: React.CSSProperties = {
    position: "absolute",
    top: 48,
    fontFamily: FONT.mono,
    fontWeight: 500,
    fontSize: TYPE.hud,
    letterSpacing: MONO_TRACKING,
    textTransform: "uppercase",
    color: c.textMuted,
    opacity: visible,
    fontVariantNumeric: "tabular-nums",
  };
  return (
    <>
      <div style={{ ...style, left: 48 }}>{chapterAt(frame)}</div>
      <div style={{ ...style, right: 48 }}>{timecode(frame)}</div>
    </>
  );
};
