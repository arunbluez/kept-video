import React from "react";
import { DRUM_ROWS, SYNTH_STEPS, sixteenthAt, sixteenthPhase } from "../system/music";
import type { PageProps } from "./types";

/**
 * `a pocket synth with 16 steps` and its remixes. The playing step is the
 * soundtrack's own 16th note (`sixteenthAt`), and the lit pads are the notes
 * the temp bed actually plays — the page plays the film's music.
 *
 * Each remix is a visibly different take: its own palette, and for two of them
 * its own instrument (a drum machine, a chord pad).
 */
export type SynthVariant = "classic" | "night" | "acid" | "drums" | "pastel" | "chords";

interface Skin {
  bg: string;
  body: string;
  bodyEdge: string;
  screen: string;
  wave: string;
  pad: string;
  padOn: string;
  padHit: string;
  ink: string;
  sub: string;
  knob: string;
  knobMark: string;
  title: string;
  font: string;
}

const SKINS: Record<SynthVariant, Skin> = {
  classic: {
    bg: "#FF6B35", body: "#FFF4E0", bodyEdge: "#F1DFC0", screen: "#1D1A2F", wave: "#7CFFCB",
    pad: "#EADBC2", padOn: "#FF6B35", padHit: "#1D1A2F", ink: "#1D1A2F", sub: "#8A7A63",
    knob: "#1D1A2F", knobMark: "#FFF4E0", title: "pocket synth", font: "Inter",
  },
  night: {
    bg: "#1A0B2E", body: "#2C1450", bodyEdge: "#3A1C66", screen: "#0D0518", wave: "#FF4FD8",
    pad: "#3E2370", padOn: "#FF4FD8", padHit: "#FFE8FA", ink: "#F6E9FF", sub: "#A88BD0",
    knob: "#FF4FD8", knobMark: "#1A0B2E", title: "pocket synth / night", font: "Inter",
  },
  acid: {
    bg: "#111111", body: "#C9C9C2", bodyEdge: "#B3B3AB", screen: "#2B2B28", wave: "#E6FF2E",
    pad: "#A7A79F", padOn: "#E6FF2E", padHit: "#111111", ink: "#111111", sub: "#55554F",
    knob: "#111111", knobMark: "#E6FF2E", title: "acid pocket", font: "'JetBrains Mono'",
  },
  drums: {
    bg: "#0FA3A3", body: "#F7F3EA", bodyEdge: "#E5DCC9", screen: "#173B3B", wave: "#FFD23F",
    pad: "#E0D8C6", padOn: "#E4572E", padHit: "#173B3B", ink: "#173B3B", sub: "#6F8F8A",
    knob: "#173B3B", knobMark: "#F7F3EA", title: "pocket drums", font: "Inter",
  },
  pastel: {
    bg: "#BDE0FE", body: "#FFFFFF", bodyEdge: "#E7F0FB", screen: "#FFE5EC", wave: "#FF7AA2",
    pad: "#E9EEF6", padOn: "#A2D2FF", padHit: "#FF7AA2", ink: "#3A3F58", sub: "#8C93AE",
    knob: "#FFAFCC", knobMark: "#FFFFFF", title: "pocket synth ♡", font: "Inter",
  },
  chords: {
    bg: "#2D6A4F", body: "#F1FAEE", bodyEdge: "#DCEBD8", screen: "#1B4332", wave: "#B7E4C7",
    pad: "#D8E9D6", padOn: "#52B788", padHit: "#1B4332", ink: "#1B4332", sub: "#5E8C74",
    knob: "#1B4332", knobMark: "#F1FAEE", title: "chord pocket", font: "Inter",
  },
};

export const SYNTH_TITLES: Record<SynthVariant, string> = Object.fromEntries(
  (Object.keys(SKINS) as SynthVariant[]).map((k) => [k, SKINS[k].title]),
) as Record<SynthVariant, string>;

const Knob: React.FC<{ x: number; y: number; v: number; label: string; s: Skin }> = ({ x, y, v, label, s }) => {
  const a = -135 + v * 270;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 110, textAlign: "center" }}>
      <div
        style={{
          width: 92,
          height: 92,
          margin: "0 auto",
          borderRadius: "50%",
          background: s.knob,
          position: "relative",
          transform: `rotate(${a}deg)`,
        }}
      >
        <div style={{ position: "absolute", left: 42, top: 8, width: 8, height: 26, borderRadius: 4, background: s.knobMark }} />
      </div>
      <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 17, letterSpacing: "0.1em", color: s.sub }}>
        {label}
      </div>
    </div>
  );
};

export const Synth: React.FC<PageProps & { variant?: SynthVariant }> = ({ f, variant = "classic" }) => {
  const s = SKINS[variant];
  const step = sixteenthAt(f);
  const phase = sixteenthPhase(f);
  const t = f / 60;
  const hit = SYNTH_STEPS[step] !== null;
  const amp = hit ? 1 - phase * 0.7 : 0.35;

  // the oscilloscope: a saw for classic/acid, a softer sine-ish shape otherwise
  const wave: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const ph = u * 6 + t * 3;
    const saw = (ph % 1) * 2 - 1;
    const sine = Math.sin(ph * Math.PI * 2);
    const v = variant === "classic" || variant === "acid" ? saw : sine;
    wave.push(`${(u * 480).toFixed(1)},${(80 - v * 52 * amp).toFixed(1)}`);
  }

  const rows = variant === "drums" ? DRUM_ROWS : [SYNTH_STEPS.map((n) => (n === null ? 0 : 1))];
  const padSize = variant === "drums" ? 46 : 58;
  const rowGap = variant === "drums" ? 14 : 0;

  return (
    <div style={{ width: 1600, height: 900, background: s.bg, position: "relative", overflow: "hidden", fontFamily: s.font }}>
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 130,
          width: 1200,
          height: 640,
          borderRadius: 44,
          background: s.body,
          boxShadow: `0 14px 0 ${s.bodyEdge}`,
        }}
      >
        <div style={{ position: "absolute", left: 64, top: 52 }}>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", color: s.ink }}>{s.title}</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, letterSpacing: "0.1em", color: s.sub, marginTop: 6 }}>
            {variant === "drums" ? "4 × 16 STEPS · 120 BPM" : "16 STEPS · 120 BPM"}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 168,
            width: 480,
            height: 160,
            borderRadius: 20,
            background: s.screen,
            overflow: "hidden",
          }}
        >
          <svg width={480} height={160}>
            <polyline points={wave.join(" ")} fill="none" stroke={s.wave} strokeWidth={4} strokeLinejoin="round" />
          </svg>
        </div>
        <Knob x={600} y={170} v={0.62 + 0.06 * Math.sin(t)} label="CUTOFF" s={s} />
        <Knob x={740} y={170} v={0.35} label="RES" s={s} />
        <Knob x={880} y={170} v={0.5 + 0.1 * Math.sin(t * 0.7 + 1)} label="DECAY" s={s} />
        <Knob x={1020} y={170} v={0.5} label="TEMPO" s={s} />
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: variant === "drums" ? 46 : 92,
            display: "flex",
            flexDirection: "column",
            gap: rowGap,
          }}
        >
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", justifyContent: "space-between" }}>
              {row.map((on, i) => {
                const playing = i === step;
                const lit = on === 1;
                const flash = playing && lit ? 1 - phase : 0;
                return (
                  <div
                    key={i}
                    style={{
                      width: padSize + (variant === "drums" ? 12 : 0),
                      height: padSize,
                      marginRight: i % 4 === 3 && i < 15 ? 22 : 0,
                      borderRadius: 14,
                      background: playing && lit ? s.padHit : lit ? s.padOn : s.pad,
                      outline: playing ? `4px solid ${s.padHit}` : "none",
                      outlineOffset: 4,
                      transform: `scale(${1 + flash * 0.06})`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
