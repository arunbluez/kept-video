import React from "react";
import type { Model } from "../copy";
import { Aquarium } from "./Aquarium";
import { Pomodoro, Specimen, Tiles } from "./Extras";
import { ORRERY_SOURCE, Orrery } from "./Orrery";
import { Platformer } from "./Platformer";
import { Rhine } from "./Rhine";
import { SYNTH_TITLES, Synth, type SynthVariant } from "./Synth";
import { PAGE_H, PAGE_W } from "./types";

/**
 * The sample pages (brief §8): AI-made, each with its own palette, every one a
 * pure function of the film frame.
 */
export interface PageMeta {
  title: string;
  file: string;
  kb: number;
  model: Model;
  render: (f: number, spin?: number) => React.ReactNode;
}

const synth = (variant: SynthVariant, model: Model, file: string, kb: number): PageMeta => ({
  title: SYNTH_TITLES[variant],
  file,
  kb,
  model,
  render: (f) => <Synth f={f} variant={variant} />,
});

/** The orrery's real byte size — the film shows the real source, so the real size. */
const ORRERY_KB = Math.max(1, Math.round(new TextEncoder().encode(ORRERY_SOURCE).length / 1024));

export const PAGES = {
  orrery: { title: "orrery", file: "orrery.html", kb: ORRERY_KB, model: "Claude", render: (f, spin) => <Orrery f={f} spin={spin} /> },
  synth: synth("classic", "GPT", "pocket-synth.html", 41),
  synthNight: synth("night", "Gemini", "pocket-synth-night.html", 39),
  synthAcid: synth("acid", "Mistral", "acid-pocket.html", 44),
  synthDrums: synth("drums", "Llama", "pocket-drums.html", 47),
  synthPastel: synth("pastel", "Claude", "pocket-synth-pastel.html", 40),
  synthChords: synth("chords", "GPT", "chord-pocket.html", 43),
  rhine: { title: "Rhine levels", file: "rhine-levels.html", kb: 22, model: "Gemini", render: (f) => <Rhine f={f} /> },
  aquarium: { title: "pixel aquarium", file: "pixel-aquarium.html", kb: 16, model: "Llama", render: (f) => <Aquarium f={f} /> },
  platformer: { title: "one button", file: "one-button.html", kb: 29, model: "Mistral", render: (f) => <Platformer f={f} /> },
  pomodoro: { title: "tomato", file: "tomato.html", kb: 9, model: "GPT", render: (f) => <Pomodoro f={f} /> },
  specimen: { title: "specimen", file: "specimen.html", kb: 12, model: "Claude", render: (f) => <Specimen f={f} /> },
  tiles: { title: "truchet", file: "truchet.html", kb: 6, model: "Gemini", render: (f) => <Tiles f={f} /> },
} satisfies Record<string, PageMeta>;

export type PageId = keyof typeof PAGES;

/**
 * A page drawn at `width` px wide (16:9). The page lays out at its native
 * 1600×900 and is scaled, so a thumbnail and a full-frame view are the same
 * page.
 */
export const PageView: React.FC<{
  id: PageId;
  f: number;
  width: number;
  spin?: number;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ id, f, width, spin, radius = 0, style }) => {
  const k = width / PAGE_W;
  return (
    <div
      style={{
        width,
        height: PAGE_H * k,
        overflow: "hidden",
        borderRadius: radius,
        position: "relative",
        ...style,
      }}
    >
      <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {PAGES[id].render(f, spin)}
      </div>
    </div>
  );
};
