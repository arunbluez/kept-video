import React from "react";
import { Composition } from "remotion";
import { CUT60_FRAMES } from "./cut60";
import { Film } from "./Film";
import { FilmShort } from "./FilmShort";
import { PageSheet } from "./PageSheet";
import "./system/fonts";
import { DURATION_IN_FRAMES, FPS } from "./system/timeline";

export const Root: React.FC = () => (
  <>
    <Composition
      id="KeptFilm"
      component={Film}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition id="KeptFilm60" component={FilmShort} durationInFrames={CUT60_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="PageSheet" component={PageSheet} durationInFrames={600} fps={FPS} width={1920} height={1080} />
  </>
);
