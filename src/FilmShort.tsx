import React from "react";
import { AbsoluteFill, Audio, Sequence, getStaticFiles, staticFile, useCurrentFrame } from "remotion";
import { VO_LINES, voSeconds } from "./copy";
import { cutChapter, sourceFrame, wipeAt } from "./cut60";
import { FilmPicture } from "./FilmPicture";
import { Hud } from "./components/Hud";
import { clamp } from "./system/anim";
import { ThemeProvider, makeTheme, themeMix } from "./system/theme";
import { FPS, ms } from "./system/timeline";
import { EASE, HAIRLINE } from "./system/tokens";

/** A licensed/generated 60 s track, when dropped in; otherwise the conformed temp bed. */
export const MUSIC_60 = "audio/music-60.wav";
const TEMP_BED_60 = "audio/temp-bed-60.wav";

const voFiles = () => {
  const names = new Set(getStaticFiles().map((f) => f.name));
  return VO_LINES.flatMap((l) => {
    const file = [`audio/vo/${l.id}.wav`, `audio/vo/${l.id}.mp3`].find((n) => names.has(n));
    return file ? [{ ...l, file }] : [];
  });
};

/** Music gain under the VO: down to half while a line plays, 150 ms ramps. */
const duck = (frame: number, lines: { at: number; text: string }[]) => {
  let g = 1;
  for (const l of lines) {
    const a = l.at * FPS - ms(150);
    const b = (l.at + voSeconds(l.text)) * FPS + ms(150);
    const inn = clamp((frame - a) / ms(150));
    const out = clamp((b - frame) / ms(150));
    g = Math.min(g, 1 - 0.5 * Math.min(inn, out));
  }
  return g;
};

const SoundShort: React.FC = () => {
  const hasMusic = getStaticFiles().some((f) => f.name === MUSIC_60);
  const vo = voFiles();
  return (
    <>
      <Audio src={staticFile(hasMusic ? MUSIC_60 : TEMP_BED_60)} volume={(f) => 0.8 * duck(f, vo)} />
      <Audio src={staticFile("audio/sfx-60.wav")} volume={0.9} />
      {vo.map((l) => (
        <Sequence key={l.id} from={Math.round(l.at * FPS)}>
          <Audio src={staticFile(l.file)} />
        </Sequence>
      ))}
    </>
  );
};

/**
 * The film's picture at film frame `src`, drawn at cut frame `out`: a Sequence
 * offset by (out − src) shifts the clock its children read. Not `<Freeze>` —
 * Freeze clamps to this composition's 60 s, and the cut reaches 2:26 of film.
 */
const PictureAt: React.FC<{ out: number; src: number }> = ({ out, src }) => (
  <Sequence from={out - src}>
    <FilmPicture />
  </Sequence>
);

/**
 * The 60-second cut. It plays the film's own frames (src/cut60.ts). Each cut is
 * a hairline wipe — the incoming stretch is revealed left of the line, the
 * outgoing runs on to its right until the line has crossed.
 */
export const FilmShort: React.FC = () => {
  const out = useCurrentFrame();
  const src = sourceFrame(out);
  const wipe = wipeAt(out);
  const { c } = makeTheme(themeMix(src));
  const x = wipe ? EASE.camera(wipe.p) * 1940 - 10 : 0;
  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <PictureAt out={out} src={src} />
      {wipe ? (
        <>
          <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${Math.max(0, x)}px)` }}>
            <PictureAt out={out} src={wipe.outgoing} />
          </AbsoluteFill>
          <div style={{ position: "absolute", left: x, top: 0, bottom: 0, width: HAIRLINE, background: c.border }} />
        </>
      ) : null}
      <ThemeProvider mix={themeMix(src)}>
        <Hud timeFrame={out} sourceFrame={src} chapter={cutChapter(src)} />
      </ThemeProvider>
      <SoundShort />
    </AbsoluteFill>
  );
};
