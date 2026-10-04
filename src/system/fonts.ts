import { loadFont } from "@remotion/fonts";
import geist500 from "geist-fonts/geist-sans/Geist-Medium.woff2";
import geist600 from "geist-fonts/geist-sans/Geist-SemiBold.woff2";
import geist700 from "geist-fonts/geist-sans/Geist-Bold.woff2";
import inter400 from "@fontsource/inter/files/inter-latin-400-normal.woff2";
import inter500 from "@fontsource/inter/files/inter-latin-500-normal.woff2";
import inter600 from "@fontsource/inter/files/inter-latin-600-normal.woff2";
import mono400 from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2";
import mono500 from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2";
import mono600 from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff2";

/**
 * Self-hosted faces, bundled from npm so renders are offline and deterministic.
 * `loadFont` holds the render (delayRender) until each face is ready.
 */
const FACES = [
  { family: "Geist", url: geist500, weight: "500" },
  { family: "Geist", url: geist600, weight: "600" },
  { family: "Geist", url: geist700, weight: "700" },
  { family: "Inter", url: inter400, weight: "400" },
  { family: "Inter", url: inter500, weight: "500" },
  { family: "Inter", url: inter600, weight: "600" },
  { family: "JetBrains Mono", url: mono400, weight: "400" },
  { family: "JetBrains Mono", url: mono500, weight: "500" },
  { family: "JetBrains Mono", url: mono600, weight: "600" },
] as const;

export const fontsReady = Promise.all(
  FACES.map((f) => loadFont({ family: f.family, url: f.url, weight: f.weight })),
);
