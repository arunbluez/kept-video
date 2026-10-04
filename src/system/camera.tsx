import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CAMERA_KEYS, type CamKey } from "../acts/camera-path";
import { track } from "./anim";

export interface Cam {
  /** World point at the centre of the frame. */
  x: number;
  y: number;
  /** Zoom: 1 = one world pixel per screen pixel. */
  s: number;
  /** Roll in degrees. Kept at 0 — the film never spins. */
  r: number;
}

const keys: ReadonlyArray<Required<Omit<CamKey, "ease">> & Pick<CamKey, "ease">> =
  CAMERA_KEYS.map((k) => ({ r: 0, ...k }));

/**
 * The camera at a (possibly fractional) frame. Interpolates every keyframe
 * with the easing of the key it arrives at — `ease-camera` for travel, so a
 * move starting from rest eases in and out (brief §4.5).
 */
export function cameraAt(frame: number): Cam {
  // Scale is interpolated in log space so a 0.5→2× zoom feels even.
  const ls = track(
    frame,
    keys.map((k) => ({ f: k.f, ease: k.ease, v: Math.log(k.s) })),
    "v",
  );
  return {
    x: track(frame, keys, "x"),
    y: track(frame, keys, "y"),
    s: Math.exp(ls),
    r: track(frame, keys, "r"),
  };
}

const CamCtx = createContext<Cam>({ x: 960, y: 540, s: 1, r: 0 });

export const useCam = (): Cam => useContext(CamCtx);

/**
 * The world plane. Reads the frame itself (not from a parent) so that inside
 * `CameraMotionBlur`, which renders its children at sub-frame offsets, the
 * camera moves between samples and actually blurs.
 */
export const CameraRig: React.FC<{
  children: React.ReactNode;
  width: number;
  height: number;
}> = ({ children, width, height }) => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  return (
    <CamCtx.Provider value={cam}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          transformOrigin: "0 0",
          transform: `translate(960px, 540px) rotate(${cam.r}deg) scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        {children}
      </div>
    </CamCtx.Provider>
  );
};

/** Provide the camera to a screen-space layer (supers) without transforming it. */
export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return <CamCtx.Provider value={cameraAt(frame)}>{children}</CamCtx.Provider>;
};
