import React, { createContext, useContext, useMemo } from "react";
import { interpolateColors } from "remotion";
import { prog } from "./anim";
import { THEME_SWAPS } from "./timeline";
import { DARK, EASE, LIGHT, SHADOW, type Palette, type ShadowName } from "./tokens";

/** 0 = light, 1 = dark. Interpolated, never flipped (T5). */
export function themeMix(frame: number): number {
  let mix = 0;
  for (const s of THEME_SWAPS) {
    const p = prog(frame, s.from, s.to - s.from, EASE.camera);
    mix = s.dir > 0 ? Math.max(mix, p) : mix * (1 - p);
  }
  return mix;
}

export interface Theme {
  mix: number;
  c: Palette;
  /** A warm shadow at the current theme, optionally scaled for film size. */
  shadow: (name: ShadowName, scale?: number) => string;
}

function mixColor(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return interpolateColors(t, [0, 1], [a, b]);
}

export function makeTheme(mix: number): Theme {
  const c = {} as Palette;
  for (const k of Object.keys(LIGHT) as (keyof Palette)[]) {
    c[k] = mixColor(LIGHT[k], DARK[k], mix);
  }
  const shadow = (name: ShadowName, scale = 1): string => {
    const [x, y, blur, lightColor] = SHADOW.light[name];
    const darkColor = SHADOW.dark[name][3];
    return `${x * scale}px ${y * scale}px ${blur * scale}px ${mixColor(
      lightColor,
      darkColor,
      mix,
    )}`;
  };
  return { mix, c, shadow };
}

const ThemeCtx = createContext<Theme>(makeTheme(0));

export const ThemeProvider: React.FC<{ mix: number; children: React.ReactNode }> = ({
  mix,
  children,
}) => {
  const theme = useMemo(() => makeTheme(mix), [mix]);
  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
};

/** A fixed theme for a subtree, e.g. a hosted page that keeps its own scheme. */
export const useTheme = (): Theme => useContext(ThemeCtx);
