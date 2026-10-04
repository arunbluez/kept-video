import React from "react";
import { prog } from "../system/anim";
import { useTheme } from "../system/theme";
import { FPS, HUD_HIDDEN, ms } from "../system/timeline";
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
 *
 * `timeFrame` is the clock shown (the cut's own); `sourceFrame` is where in the
 * film the picture is, which decides when the HUD hides.
 */
export const Hud: React.FC<{ timeFrame: number; sourceFrame: number; chapter: string }> = ({
  timeFrame,
  sourceFrame,
  chapter,
}) => {
  const { c } = useTheme();
  let visible = prog(timeFrame, 0, ms(500));
  for (const w of HUD_HIDDEN) {
    const hide = prog(sourceFrame, w.from, ms(240)) * (1 - prog(sourceFrame, w.to, ms(400)));
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
      <div style={{ ...style, left: 48 }}>{chapter}</div>
      <div style={{ ...style, right: 48 }}>{timecode(timeFrame)}</div>
    </>
  );
};
