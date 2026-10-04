import React from "react";
import { useCurrentFrame } from "remotion";
import { Link2 } from "lucide-react";
import { SuperAt } from "../components/SuperAt";
import { Mono } from "../components/Type";
import { PageView } from "../pages";
import { ORRERY_SOURCE } from "../pages/Orrery";
import { clamp, lerp, prog } from "../system/anim";
import { useTheme } from "../system/theme";
import { at, ms } from "../system/timeline";
import { EASE, FONT, HAIRLINE, RF, TYPE } from "../system/tokens";

/**
 * Act 1 — STUCK (0:12–0:22). Three ways a page fails to travel, side by side,
 * then the line the whole film answers.
 */

/** Vignette times follow the copy sheet (one beat earlier than the brief). */
const PANELS = [
  { x: 120, at: 13.0 },
  { x: 690, at: 15.0 },
  { x: 1260, at: 17.0 },
] as const;
const PANEL = { y: 170, w: 540, h: 350 };
export const SOURCE_LINES = ORRERY_SOURCE.split("\n").length;

/** All three vignettes leave together, clearing the canvas for 0:19.5. */
const exitAt = at(19.0);

const usePanelMotion = (i: number) => {
  const frame = useCurrentFrame();
  const enter = prog(frame, at(PANELS[i]!.at), ms(400));
  const exit = prog(frame, exitAt + i * ms(40), ms(400), EASE.camera);
  return {
    frame,
    style: {
      position: "absolute" as const,
      left: PANELS[i]!.x,
      top: PANEL.y + (1 - enter) * 24 - exit * 80,
      width: PANEL.w,
      height: PANEL.h,
      opacity: enter * (1 - exit),
    },
  };
};

/** Four corner brackets that snap in around a frozen frame. */
const Brackets: React.FC<{ w: number; h: number; p: number; color: string }> = ({ w, h, p, color }) => {
  const arm = 44;
  const off = (1 - p) * 34;
  const corners = [
    { x: -off, y: -off, sx: 1, sy: 1 },
    { x: w + off, y: -off, sx: -1, sy: 1 },
    { x: -off, y: h + off, sx: 1, sy: -1 },
    { x: w + off, y: h + off, sx: -1, sy: -1 },
  ];
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: clamp(p * 3) }}>
      {corners.map((k, i) => (
        <path
          key={i}
          d={`M ${k.x} ${k.y + arm * k.sy} L ${k.x} ${k.y} L ${k.x + arm * k.sx} ${k.y}`}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="square"
        />
      ))}
    </svg>
  );
};

const Screenshot: React.FC = () => {
  const { frame, style } = usePanelMotion(0);
  const { c } = useTheme();
  const snap = at(13.5);
  // the orrery enlarges, spinning — then motion stops dead on the snap
  const f = Math.min(frame, snap);
  const grow = prog(frame, at(13.0), ms(500), EASE.out);
  const spin = (f - at(13.0)) * 2.4;
  const bp = prog(frame, snap, ms(240), EASE.spring);
  const w = lerp(380, 500, grow);
  return (
    <div style={style}>
      <div style={{ position: "absolute", left: (PANEL.w - w) / 2, top: 34 + (281 - (w * 9) / 16) / 2 }}>
        <PageView id="orrery" f={f * 1.6} spin={spin} width={w} radius={RF.md} />
        {frame >= snap ? <Brackets w={w} h={(w * 9) / 16} p={bp} color={c.text} /> : null}
      </div>
      {frame >= snap ? (
        <Mono size={20} color={c.textSecondary} style={{ position: "absolute", left: 20, top: -8, opacity: bp }}>
          Screenshot.png
        </Mono>
      ) : null}
    </div>
  );
};

const LocalFile: React.FC = () => {
  const { frame, style } = usePanelMotion(1);
  const { c, shadow } = useTheme();
  const t0 = at(15.0) + ms(300);
  // slides toward the edge, meets an invisible wall, eases back and greys out
  const out = prog(frame, t0, ms(600), EASE.camera);
  const bump = prog(frame, t0 + ms(600), ms(160), EASE.out);
  const back = prog(frame, t0 + ms(760), ms(500), EASE.out);
  const chipW = 470;
  const wall = PANEL.w - 10;
  const x = lerp(30, wall - chipW, out) - back * 70;
  const squash = 1 - Math.sin(bump * Math.PI) * 0.05;
  const grey = prog(frame, t0 + ms(760), ms(400));
  return (
    <div style={style}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: 150,
          width: chipW,
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 22px",
          boxSizing: "border-box",
          borderRadius: RF.pill,
          background: c.surface,
          border: `${HAIRLINE}px solid ${c.border}`,
          boxShadow: shadow("sm", 1.6),
          transform: `scaleX(${squash})`,
          transformOrigin: "100% 50%",
          fontFamily: FONT.mono,
          fontSize: 21,
          color: grey > 0.5 ? c.textMuted : c.text,
          whiteSpace: "nowrap",
        }}
      >
        <Link2 size={24} color={grey > 0.5 ? c.textMuted : c.textSecondary} strokeWidth={1.8} />
        file:///Users/you/orrery.html
      </div>
    </div>
  );
};

const Pasted: React.FC = () => {
  const { frame, style } = usePanelMotion(2);
  const { c } = useTheme();
  const t0 = at(17.0) + ms(200);
  const fill = prog(frame, t0, ms(500), EASE.out);
  const scroll = Math.max(0, frame - t0 - ms(300)) * 6;
  return (
    <div style={style}>
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 34,
          width: 470,
          height: lerp(64, 281, fill),
          borderRadius: `${RF.xl}px ${RF.xl}px ${RF.sm}px ${RF.xl}px`,
          background: c.accentSoft,
          overflow: "hidden",
        }}
      >
        <pre
          style={{
            margin: 0,
            padding: "16px 22px",
            fontFamily: FONT.mono,
            fontSize: 10,
            lineHeight: "13px",
            color: c.textSecondary,
            transform: `translateY(${-scroll}px)`,
            whiteSpace: "pre",
          }}
        >
          {ORRERY_SOURCE}
          {"\n"}
          {ORRERY_SOURCE}
        </pre>
      </div>
      <Mono size={20} color={c.textSecondary} style={{ position: "absolute", left: 60, top: -8, opacity: fill }}>
        {`Pasted · ${SOURCE_LINES} lines`}
      </Mono>
    </div>
  );
};

export const Act1World: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= exitAt + ms(600)) return null;
  return (
    <>
      {frame >= at(PANELS[0].at) ? <Screenshot /> : null}
      {frame >= at(PANELS[1].at) ? <LocalFile /> : null}
      {frame >= at(PANELS[2].at) ? <Pasted /> : null}
    </>
  );
};

/** "Your work deserves a link." — Act 2's tile is revealed by this super's exit wipe. */
export const DESERVES = { cx: 960, width: 1100 };

export const Act1Overlay: React.FC = () => (
  <>
    <SuperAt id="screenshots" x={PANELS[0].x} y={570} size={60} width={PANEL.w} />
    <SuperAt id="localFiles" x={PANELS[1].x} y={570} size={60} width={PANEL.w} />
    <SuperAt id="pasted" x={PANELS[2].x} y={570} size={60} width={PANEL.w} />
    <SuperAt id="deserves" x={DESERVES.cx} y={226} size={TYPE.displayXL} width={DESERVES.width} align="center" />
  </>
);
