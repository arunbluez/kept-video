import React from "react";
import { useCurrentFrame } from "remotion";
import { CARD_H, CARD_W, FileCard } from "../components/ui";
import { Mono } from "../components/Type";
import type { PageId } from "../pages";
import { arc, lerp, prog } from "../system/anim";
import { useTheme } from "../system/theme";
import { at, ms } from "../system/timeline";
import { EASE, RF } from "../system/tokens";
import { REGION } from "../system/world";

/**
 * The downloaded files, from the moment Act 0 makes them to the moment Act 2's
 * cursor carries the orrery into the drop tile. One component, world space, so
 * the pile survives the camera's travel from Act 0 into Act 1's Downloads tray.
 */

export const MONTAGE: { id: PageId; at: number }[] = [
  { id: "orrery", at: 6.0 },
  { id: "synth", at: 6.0 },
  { id: "rhine", at: 7.0 },
  { id: "aquarium", at: 8.0 },
  { id: "platformer", at: 9.0 },
];

/** Card centres in Act 0's loose pile (world = Act 0 local). */
const PILE = [
  { x: 1390, y: 868, r: -3 },
  { x: 1430, y: 762, r: 2.5 },
  { x: 1372, y: 656, r: -1.5 },
  { x: 1442, y: 548, r: 3 },
  { x: 1400, y: 442, r: -2 },
];

/** The Downloads tray, in Act 1's region. */
export const TRAY = { x: REGION.a1.x + 90, y: REGION.a1.y + 800, w: 540, h: 214 };
const TRAY_SCALE = 0.62;
const traySlot = (i: number) => ({
  x: TRAY.x + 34 + (CARD_W * TRAY_SCALE) / 2 + i * 18,
  y: TRAY.y + 30 + (CARD_H * TRAY_SCALE) / 2 + i * 26,
  r: [-2, 1.5, -1, 2, 0][i]!,
});

/** Where the orrery card is born (Act 0, centre) and where it is dropped (Act 2's tile). */
const BIRTH = { x: 960, y: 560 };
export const ORRERY_CARRY = {
  pick: at(23.0),
  drop: at(25.0),
  /** Over the tile's icon, in world space (Act 2 draws the tile at y 520). */
  tile: { x: REGION.a1.x + 960, y: REGION.a1.y + 520 - 96 },
};

/** Spawn point for the montage cards: just under the prompt field. */
const SPAWN = { x: 1400, y: 330 };

export function cardPose(i: number, frame: number): { x: number; y: number; r: number; s: number; lift: number; o: number } {
  const m = MONTAGE[i]!;
  const pile = PILE[i]!;
  const tray = traySlot(i);
  const travel = prog(frame, at(12.0) + i * ms(40), ms(1200), EASE.camera);
  let x: number;
  let y: number;
  let r: number;
  let s = 1;
  let o = 1;
  if (i === 0) {
    // born at centre from the code column, then sent to the pile on the montage's first beat
    const p = prog(frame, at(6.0), ms(500), EASE.out);
    const pt = arc(p, BIRTH.x, BIRTH.y, pile.x, pile.y, -60);
    x = pt.x;
    y = pt.y;
    r = lerp(0, pile.r, p);
    s = prog(frame, at(5.5) + ms(160), ms(240), EASE.spring);
    o = prog(frame, at(5.5) + ms(120), ms(160));
  } else {
    // spat out by the prompt half a beat after it is typed, then slid to the pile
    const born = at(m.at) + ms(500);
    const p = prog(frame, born + ms(80), ms(420), EASE.out);
    const pt = arc(p, SPAWN.x, SPAWN.y + 80, pile.x, pile.y, 40);
    x = pt.x;
    y = pt.y;
    r = lerp(0, pile.r, p);
    s = lerp(0.9, 1, prog(frame, born, ms(240), EASE.spring));
    o = prog(frame, born, ms(160));
  }
  // into the tray as the camera travels right
  x = lerp(x, tray.x, travel);
  y = lerp(y, tray.y, travel);
  r = lerp(r, tray.r, travel);
  s *= lerp(1, TRAY_SCALE, travel);
  let lift = 0;
  if (i === 0 && frame >= ORRERY_CARRY.pick - ms(200)) {
    // Act 2: the cursor lifts the orrery out of the tray and carries it in an arc
    lift = prog(frame, ORRERY_CARRY.pick, ms(160));
    const c = prog(frame, ORRERY_CARRY.pick + ms(160), ORRERY_CARRY.drop - ORRERY_CARRY.pick - ms(160), EASE.camera);
    const pt = arc(c, tray.x, tray.y, ORRERY_CARRY.tile.x, ORRERY_CARRY.tile.y, 220);
    x = pt.x;
    y = pt.y;
    r = lerp(tray.r, 4, c);
    s = lerp(TRAY_SCALE, 0.8, c);
  }
  return { x, y, r, s, lift, o };
}

export const Pile: React.FC = () => {
  const frame = useCurrentFrame();
  const { c } = useTheme();
  const trayIn = prog(frame, at(12.0) + ms(300), ms(700));
  return (
    <>
      {trayIn > 0 ? (
        <div
          style={{
            position: "absolute",
            left: TRAY.x,
            top: TRAY.y,
            width: TRAY.w,
            height: TRAY.h,
            borderRadius: RF.xl,
            background: c.surfaceSunken,
            opacity: trayIn,
          }}
        >
          <Mono size={20} style={{ position: "absolute", left: 4, top: -38 }}>
            Downloads
          </Mono>
        </div>
      ) : null}
      {MONTAGE.map((m, i) => {
        if (frame < at(i === 0 ? 5.5 : m.at)) return null;
        // the orrery leaves the pile when it is dropped (Act 2 takes over)
        if (i === 0 && frame >= ORRERY_CARRY.drop) return null;
        const p = cardPose(i, frame);
        return (
          <div
            key={m.id}
            style={{
              position: "absolute",
              left: p.x - CARD_W / 2,
              top: p.y - CARD_H / 2,
              transform: `rotate(${p.r}deg) scale(${p.s})`,
              opacity: p.o,
              zIndex: i === 0 && p.lift > 0 ? 10 : i,
            }}
          >
            <FileCard id={m.id} f={frame} lift={p.lift} />
          </div>
        );
      })}
    </>
  );
};

/** A world-space anchor for the cursor that carries the orrery (Act 2). */
export const orreryCardAt = (frame: number) => {
  const p = cardPose(0, frame);
  return { x: p.x, y: p.y };
};
