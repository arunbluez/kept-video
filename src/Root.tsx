import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import "./system/fonts";
import { DURATION_IN_FRAMES, FPS } from "./system/timeline";

export const Root: React.FC = () => (
  <Composition
    id="KeptFilm"
    component={Film}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
