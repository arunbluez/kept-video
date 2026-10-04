import type React from "react";
import { at } from "../system/timeline";
import { REGION, type Region } from "../system/world";
import { Act0Overlay, Act0World } from "./Act0";
import { Act1Overlay, Act1World } from "./Act1";
import { Act2Overlay, Act2World } from "./Act2";
import { Act3Overlay, Act3World } from "./Act3";
import { Act4Overlay, Act4World } from "./Act4";
import { Pile } from "./Pile";

/**
 * The film's scenes. `world` draws in world space at `region` (or, with
 * `region: null`, in raw world coordinates); `overlay` draws in screen space
 * above it (supers). Each is mounted only inside `[from, to)` — scenes far from
 * the camera are unmounted (brief §5.2).
 */
export interface Scene {
  name: string;
  from: number;
  to: number;
  region: Region | null;
  world?: React.FC;
  overlay?: React.FC;
}

export const SCENES: Scene[] = [
  { name: "act0", from: 0, to: at(13.5), region: REGION.a0, world: Act0World, overlay: Act0Overlay },
  { name: "act1", from: at(12.5), to: at(22.5), region: REGION.a1, world: Act1World, overlay: Act1Overlay },
  { name: "act2", from: at(21.5), to: at(44.5), region: REGION.a1, world: Act2World, overlay: Act2Overlay },
  { name: "act3", from: at(43.5), to: at(64.0), region: REGION.a3, world: Act3World, overlay: Act3Overlay },
  { name: "act4", from: at(61.5), to: at(86.0), region: REGION.a3, world: Act4World, overlay: Act4Overlay },
  { name: "pile", from: at(5.5), to: at(25.5), region: null, world: Pile },
];
