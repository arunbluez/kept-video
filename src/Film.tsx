import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Mascot } from "./components/Mascot";
import { Super } from "./components/Type";
import { Grid } from "./components/Grid";
import { Hud } from "./components/Hud";
import { CameraProvider, CameraRig } from "./system/camera";
import { ThemeProvider, themeMix, makeTheme } from "./system/theme";
import { WORLD_H, WORLD_W } from "./system/world";

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const mix = themeMix(frame);
  const { c } = makeTheme(mix);
  return (
    <ThemeProvider mix={mix}>
      <AbsoluteFill style={{ background: c.bg, overflow: "hidden" }}>
        <CameraRig width={WORLD_W} height={WORLD_H}>
          <Grid />
          <div style={{ position: "absolute", left: 860, top: 640 }}>
            <Mascot t={frame / 60} size={200} id="m1" />
          </div>
        </CameraRig>
        <CameraProvider>
          <Super from={30} to={400} x={120} y={300} size={120} width={1200}
            lines={[["Your", "work", "deserves"], ["a", { t: "link.", accent: true }]]}
            mono="GAMES · TOOLS · SCENES" />
        </CameraProvider>
        <Hud />
      </AbsoluteFill>
    </ThemeProvider>
  );
};
