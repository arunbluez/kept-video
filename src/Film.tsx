import React from "react";
import { AbsoluteFill, Audio, getStaticFiles, staticFile, useCurrentFrame } from "remotion";
import { FilmPicture } from "./FilmPicture";
import { Hud } from "./components/Hud";
import { ThemeProvider, themeMix } from "./system/theme";
import { chapterAt } from "./system/timeline";

/**
 * The licensed track, when it has been dropped in; otherwise the synthesised
 * temp bed (scripts/audio.ts), which must not be published.
 */
export const MUSIC_FILE = "audio/music.wav";
const TEMP_BED = "audio/temp-bed.wav";

const Sound: React.FC = () => {
  const hasMusic = getStaticFiles().some((f) => f.name === MUSIC_FILE);
  return (
    <>
      <Audio src={staticFile(hasMusic ? MUSIC_FILE : TEMP_BED)} volume={0.8} />
      <Audio src={staticFile("audio/sfx.wav")} volume={0.9} />
    </>
  );
};

/** The 150 s launch film. */
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <FilmPicture />
      <ThemeProvider mix={themeMix(frame)}>
        <Hud timeFrame={frame} sourceFrame={frame} chapter={chapterAt(frame)} />
      </ThemeProvider>
      <Sound />
    </AbsoluteFill>
  );
};
