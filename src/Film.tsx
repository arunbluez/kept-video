import React from "react";
import { AbsoluteFill, Audio, getStaticFiles, staticFile, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { SCENES } from "./acts";
import { Grid } from "./components/Grid";
import { Hud } from "./components/Hud";
import { CameraProvider, CameraRig } from "./system/camera";
import { ThemeProvider, makeTheme, themeMix } from "./system/theme";
import { WHIPS } from "./system/timeline";
import { WORLD_H, WORLD_W } from "./system/world";

/** The world plane: grid + every mounted scene, under the one camera. */
const WorldPlane: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CameraRig width={WORLD_W} height={WORLD_H}>
      <Grid />
      {SCENES.map((s) => {
        if (!s.world || frame < s.from || frame >= s.to) return null;
        const W = s.world;
        return (
          <div key={s.name} style={{ position: "absolute", left: s.region?.x ?? 0, top: s.region?.y ?? 0 }}>
            <W />
          </div>
        );
      })}
    </CameraRig>
  );
};

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

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const mix = themeMix(frame);
  const { c } = makeTheme(mix);
  // T4: the camera whips are the only motion-blurred moments (180° shutter).
  const whipping = WHIPS.some((w) => frame >= w.from - 1 && frame <= w.to + 1);
  return (
    <ThemeProvider mix={mix}>
      <AbsoluteFill style={{ background: c.bg, overflow: "hidden" }}>
        {whipping ? (
          <CameraMotionBlur shutterAngle={180} samples={10}>
            <WorldPlane />
          </CameraMotionBlur>
        ) : (
          <WorldPlane />
        )}
        <CameraProvider>
          {SCENES.map((s) => {
            if (!s.overlay || frame < s.from || frame >= s.to) return null;
            const O = s.overlay;
            return <O key={s.name} />;
          })}
        </CameraProvider>
        <Hud />
        <Sound />
      </AbsoluteFill>
    </ThemeProvider>
  );
};
