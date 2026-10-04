import React from "react";
import { useCurrentFrame } from "remotion";
import { CornerDownLeft } from "lucide-react";
import { PROMPTS } from "../copy";
import { SuperAt } from "../components/SuperAt";
import { Caret, typed } from "../components/ui";
import { ORRERY_SOURCE } from "../pages/Orrery";
import { lerp, prog } from "../system/anim";
import { useTheme } from "../system/theme";
import { at, ms } from "../system/timeline";
import { EASE, FONT, HAIRLINE, RF, TYPE } from "../system/tokens";

/**
 * Act 0 — MADE (0:00–0:12). A prompt becomes a page, then five. The first
 * colour in the film arrives small, in the file cards' thumbnails.
 */

const CODE_LINES = ORRERY_SOURCE.split("\n");
const LINE_H = 27;

/** Prompt typing windows: the orrery, then one prompt per two beats. */
const PROMPT_RUNS = [
  { text: PROMPTS.orrery, from: at(1.5), to: at(4.0) },
  { text: PROMPTS.synth16, from: at(6.0), to: at(6.0) + ms(440) },
  { text: PROMPTS.rhine, from: at(7.0), to: at(7.0) + ms(440) },
  { text: PROMPTS.aquarium, from: at(8.0), to: at(8.0) + ms(440) },
  { text: PROMPTS.platformer, from: at(9.0), to: at(9.0) + ms(440) },
];
export const ACT0_TYPING = PROMPT_RUNS;

export const Act0World: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, shadow } = useTheme();

  // ── the prompt field ─────────────────────────────────────────────
  const rise = prog(frame, at(1.0), ms(400));
  const lift = prog(frame, at(4.0), ms(400)); // Enter: the text lifts
  const toMontage = prog(frame, at(5.75), ms(500), EASE.camera);
  const fieldW = lerp(1000, 820, toMontage);
  const fieldH = lerp(128, 112, toMontage);
  const fx = lerp(960, 1400, toMontage);
  const fy = lerp(lerp(540, 196, lift), 236, toMontage) + (1 - rise) * 24;
  const textSize = lerp(40, 32, toMontage);

  const run = [...PROMPT_RUNS].reverse().find((r) => frame >= r.from) ?? PROMPT_RUNS[0]!;
  const shown = typed(frame, run.from, run.to, run.text);
  // after Enter the orrery prompt stays, dimmed, until the montage takes the field
  const typing = frame >= run.from && frame < run.to;
  const settled = run === PROMPT_RUNS[0] && frame >= at(4.0);

  // ── the code stream ──────────────────────────────────────────────
  const streamOn = frame >= at(4.0) + ms(200) && frame < at(5.5) + ms(300);
  const scrollP = (frame - (at(4.0) + ms(200))) / (at(5.5) - at(4.0) - ms(200));
  const scrollY = 560 - scrollP * (CODE_LINES.length * LINE_H);
  const collapse = prog(frame, at(5.5), ms(300), EASE.out);

  return (
    <>
      {rise > 0 ? (
        <div
          style={{
            position: "absolute",
            left: fx - fieldW / 2,
            top: fy - fieldH / 2,
            width: fieldW,
            height: fieldH,
            borderRadius: RF.xl,
            background: c.surface,
            border: `${HAIRLINE}px solid ${c.border}`,
            boxShadow: shadow("sm", 1.6),
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            boxSizing: "border-box",
            opacity: rise,
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: FONT.body,
              fontSize: textSize,
              color: settled ? c.textSecondary : c.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {settled ? PROMPTS.orrery : shown}
            {!settled ? <Caret frame={frame} color={c.accent} h={textSize * 1.1} on={typing ? true : undefined} /> : null}
          </span>
          <CornerDownLeft size={textSize * 0.9} color={c.textMuted} strokeWidth={1.8} />
        </div>
      ) : null}

      {streamOn ? (
        <div
          style={{
            position: "absolute",
            left: 960 - 470,
            top: 290,
            width: 940,
            height: 560,
            overflow: "hidden",
            transform: `scaleY(${1 - collapse})`,
            transformOrigin: "50% 270px",
          }}
        >
          {/* vertical motion blur: the column smeared along its own travel */}
          {[0, 10, 20, 30].map((off, k) => (
            <pre
              key={off}
              style={{
                position: "absolute",
                left: 0,
                top: scrollY + off,
                margin: 0,
                fontFamily: FONT.mono,
                fontSize: 18,
                lineHeight: `${LINE_H}px`,
                color: c.textMuted,
                opacity: [0.55, 0.25, 0.14, 0.08][k],
                whiteSpace: "pre",
              }}
            >
              {ORRERY_SOURCE}
            </pre>
          ))}
        </div>
      ) : null}
    </>
  );
};

export const Act0Overlay: React.FC = () => (
  <>
    <SuperAt id="made" x={120} y={300} size={TYPE.displayL} width={760} />
    <SuperAt id="good" x={120} y={560} size={TYPE.displayL} width={760} />
  </>
);
