import React from "react";
import { useCurrentFrame } from "remotion";
import { HOST, MODELS, PROMPTS, SYNTH_SLUG, type Model } from "../copy";
import { Cursor } from "../components/Cursor";
import { BadgeRule, PageBadge, Wordmark } from "../components/Frame";
import { Opening } from "../components/Opening";
import { SuperAt } from "../components/SuperAt";
import { Mono } from "../components/Type";
import { Chip, Host, LiveDot } from "../components/ui";
import { PAGES, PageView, type PageId } from "../pages";
import { PAGE_H } from "../pages/types";
import { arc, clamp, lerp, prog, track } from "../system/anim";
import { useTheme } from "../system/theme";
import { at, beats, ms } from "../system/timeline";
import { DISPLAY_LEADING, DISPLAY_TRACKING, EASE, FONT, HAIRLINE, RF, TYPE } from "../system/tokens";
import { MERGED_PILL } from "./Act3";

/**
 * Act 4 — SHARE (1:04–1:26). The pocket synth plays the film's music; its
 * badge shows how it was made; it gets remixed into a family tree; the tree
 * becomes a rail in Explore; one card becomes a share kit.
 */

/** The synth's frame — the same geometry as the orrery's (region-local). */
export const SYNTH_FRAME = { x: 160, y: 54, w: 1600, pageH: PAGE_H };
const PAGE_TOP = SYNTH_FRAME.y + 72;

const T = {
  open: at(62.0),
  badge: at(66.0),
  chipClick: at(69.0),
  remixClick: at(73.0),
  explore: at(78.0),
  filter: at(79.5),
  kit: at(81.5),
  stack: at(85.0),
};

/* ───────────────────────────── badge + drawer ───────────────────────────── */

const SYNTH_MODEL = PAGES.synth.model;

const KeptBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  // one segment per beat: kept mark · Made with {model} · Remix
  const seg = (i: number) => prog(frame, T.badge + beats(i), ms(240), EASE.out);
  if (seg(0) <= 0) return null;
  const chipPress = frame >= T.chipClick - ms(80) && frame < T.chipClick + ms(80) ? 1 : 0;
  const remixPress = frame >= T.remixClick - ms(80) && frame < T.remixClick + ms(80) ? 1 : 0;
  const segStyle = (i: number): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 18,
    opacity: seg(i),
    transform: `translateY(${(1 - seg(i)) * 14}px)`,
  });
  return (
    <div style={{ position: "absolute", right: 40, bottom: 40 }}>
      <PageBadge size={30}>
        <span style={segStyle(0)}>
          <Wordmark size={34} />
        </span>
        <span style={segStyle(1)}>
          <BadgeRule h={34} />
          <span style={{ color: c.text, transform: `scale(${1 - chipPress * 0.03})`, display: "inline-block" }}>Made with {SYNTH_MODEL}</span>
        </span>
        <span style={segStyle(2)}>
          <BadgeRule h={34} />
          <span style={{ color: c.accent, transform: `scale(${1 - remixPress * 0.05})`, display: "inline-block" }}>Remix</span>
        </span>
      </PageBadge>
    </div>
  );
};

const PromptDrawer: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  const open = prog(frame, T.chipClick + ms(80), ms(400), EASE.out);
  const close = prog(frame, T.remixClick - ms(500), ms(300), EASE.out);
  if (open <= 0 || close >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        bottom: 150,
        width: 700,
        padding: "34px 40px",
        boxSizing: "border-box",
        borderRadius: RF.xl,
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: shadow("lg", 1.6),
        clipPath: `inset(${(1 - open) * 100}% 0 0 0 round ${RF.xl}px)`,
        opacity: 1 - close,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Mono size={24} color={c.textSecondary}>
          Prompt
        </Mono>
        <span style={{ flex: 1 }} />
        <Chip tone="accent" size={20}>
          Opt-in
        </Chip>
      </div>
      <div style={{ marginTop: 20, fontFamily: FONT.body, fontSize: 36, lineHeight: 1.35, color: c.text }}>{PROMPTS.agent}</div>
      <div style={{ marginTop: 18 }}>
        <Mono size={20}>{`Made with ${SYNTH_MODEL} · shared by the author`}</Mono>
      </div>
    </div>
  );
};

/* ─────────────────────────────── cards ─────────────────────────────── */

const CARD_W = 440;
const CARD_PAGE_W = CARD_W - 24;
const CARD_H = 12 + (CARD_PAGE_W * 9) / 16 + 84;

const PageCard: React.FC<{ id: PageId; f: number; lift?: number; dim?: number; counter?: React.ReactNode }> = ({
  id,
  f,
  lift = 0,
  dim = 0,
  counter,
}) => {
  const { c, shadow } = useTheme();
  const page = PAGES[id];
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        padding: 12,
        boxSizing: "border-box",
        borderRadius: RF.lg,
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: shadow(lift > 0.5 ? "lg" : "sm", 1.6),
        opacity: 1 - dim * 0.65,
      }}
    >
      <PageView id={id} f={f} width={CARD_PAGE_W} radius={RF.sm} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, padding: "0 6px" }}>
        <span style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 24, color: c.text, whiteSpace: "nowrap" }}>{page.title}</span>
        <span style={{ flex: 1 }} />
        {counter ?? (
          <Chip tone="sunken" size={16}>
            {`Made with ${page.model}`}
          </Chip>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────── the remix tree ─────────────────────────── */

type Node = { id: PageId; x: number; y: number; at: number; parent: "root" | PageId };

/** The family tree (centres, region-local): three remixes, one of which is remixed twice. */
const TREE: Node[] = [
  { id: "synthNight", x: 760, y: 1390, at: 73.5, parent: "root" },
  { id: "synthAcid", x: 1240, y: 1390, at: 74.0, parent: "root" },
  { id: "synthDrums", x: 1720, y: 1390, at: 74.5, parent: "root" },
  { id: "synthPastel", x: 1000, y: 1880, at: 75.5, parent: "synthAcid" },
  { id: "synthChords", x: 1480, y: 1880, at: 76.0, parent: "synthAcid" },
];
const ROOT_BOTTOM = { x: 960, y: SYNTH_FRAME.y + 72 + PAGE_H };

/* ───────────────────────────── Explore ───────────────────────────── */

const EXPLORE_Y = 1880; // region-local y of the Explore screen's top
const RAIL_Y = EXPLORE_Y + 440;
const RAIL_X0 = 120;
const RAIL_STEP = 470;
/** Rail order before and after the filter (FLIP re-sort). */
const RAIL: PageId[] = ["synth", "synthNight", "synthAcid", "synthDrums", "synthPastel", "synthChords"];
const FILTER: Model = SYNTH_MODEL;
const RAIL_SORTED: PageId[] = [...RAIL.filter((id) => PAGES[id].model === FILTER), ...RAIL.filter((id) => PAGES[id].model !== FILTER)];

const railPos = (id: PageId, frame: number) => {
  const before = RAIL.indexOf(id);
  const after = RAIL_SORTED.indexOf(id);
  const p = prog(frame, T.filter, ms(400), EASE.out);
  return { x: RAIL_X0 + lerp(before, after, p) * RAIL_STEP + CARD_W / 2, y: RAIL_Y + CARD_H / 2 };
};

/* ───────────────────────────── share kit ───────────────────────────── */

const KIT = { image: { cx: 900, cy: EXPLORE_Y + 560, w: 640 }, clip: { cx: 1500, cy: EXPLORE_Y + 560, w: 480 } };

/** A card's pose through tree → rail → (kit) → stack. */
function cardPose(id: PageId, frame: number): { x: number; y: number; s: number; r: number; o: number } | null {
  const node = TREE.find((n) => n.id === id);
  const stackP = prog(frame, T.stack, ms(400), EASE.camera);
  const stack = { x: 1500, y: EXPLORE_Y + 560 };
  let x: number;
  let y: number;
  let r = 0;
  let o = 1;
  if (node) {
    if (frame < at(node.at)) return null;
    // peeled off the parent like a dealt card
    const from = node.parent === "root" ? ROOT_BOTTOM : TREE.find((n) => n.id === node.parent)!;
    const p = prog(frame, at(node.at), ms(450), EASE.out);
    const pt = arc(p, from.x, from.y - 60, node.x, node.y, -40);
    x = pt.x;
    y = pt.y;
    r = (1 - p) * (node.x > from.x ? 8 : -8);
    o = clamp(p * 3);
  } else {
    // the parent: its frame shrinks straight into rail slot 0 (SynthFrame)
    const rp = railPos(id, frame);
    x = rp.x;
    y = rp.y;
  }
  const ex = node ? prog(frame, T.explore + RAIL.indexOf(id) * ms(40), ms(700), EASE.camera) : 0;
  if (ex > 0) {
    const rp = railPos(id, frame);
    x = lerp(x, rp.x, ex);
    y = lerp(y, rp.y, ex);
  }
  if (stackP > 0) {
    x = lerp(x, stack.x, stackP);
    y = lerp(y, stack.y, stackP);
    r = lerp(r, (RAIL.indexOf(id) - 2) * 3, stackP);
  }
  return { x, y, s: 1, r, o };
}

const Tree: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  if (frame < at(73.5)) return null;
  const linesOut = prog(frame, T.explore, ms(300));
  return (
    <>
      {/* hairline connectors: a family tree, elbowed — never a node network */}
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - linesOut }} width={1} height={1}>
        {TREE.map((n) => {
          const from = n.parent === "root" ? ROOT_BOTTOM : { x: TREE.find((m) => m.id === n.parent)!.x, y: TREE.find((m) => m.id === n.parent)!.y + CARD_H / 2 };
          const top = n.y - CARD_H / 2;
          const midY = (from.y + top) / 2;
          const d = `M ${from.x} ${from.y} V ${midY} H ${n.x} V ${top}`;
          const p = prog(frame, at(n.at) + ms(200), ms(400), EASE.out);
          return (
            <path key={n.id} d={d} fill="none" stroke={c.border} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
          );
        })}
      </svg>
    </>
  );
};

const Cards: React.FC<{ frame: number }> = ({ frame }) => {
  const kitP = prog(frame, T.kit, ms(500), EASE.camera);
  return (
    <>
      {RAIL.map((id) => {
        if (id === "synth" && frame < T.explore + ms(500)) return null;
        const pose = cardPose(id, frame);
        if (!pose) return null;
        // the share kit: the synth's card lifts away from the rail and splits
        if (id === "synth" && kitP > 0) return null;
        const dim = frame >= T.filter ? prog(frame, T.filter, ms(400)) * (PAGES[id].model === FILTER ? 0 : 1) : 0;
        // the rail clears while the share kit has the stage, then returns for the stack
        const kitDim = prog(frame, T.kit, ms(400)) * (1 - prog(frame, T.stack, ms(200)));
        return (
          <div
            key={id}
            style={{
              position: "absolute",
              left: pose.x - CARD_W / 2,
              top: pose.y - CARD_H / 2,
              transform: `translateY(${kitDim * 60}px) rotate(${pose.r}deg)`,
              opacity: pose.o * (1 - kitDim),
            }}
          >
            <PageCard id={id} f={frame} dim={dim} />
          </div>
        );
      })}
    </>
  );
};

/** The parent frame shrinks into the rail's first slot as Explore opens. */
const SynthFrame: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.open || frame >= T.explore + ms(500)) return null;
  const shrink = prog(frame, T.explore, ms(500), EASE.camera);
  const slot = railPos("synth", T.explore);
  const k = lerp(1, CARD_W / SYNTH_FRAME.w, shrink);
  const fx = lerp(SYNTH_FRAME.x, slot.x - CARD_W / 2, shrink);
  const fy = lerp(SYNTH_FRAME.y, slot.y - CARD_H / 2, shrink);
  const remixes = TREE.filter((n) => n.parent === "root" && frame >= at(n.at)).length;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${fx - SYNTH_FRAME.x}px, ${fy - SYNTH_FRAME.y}px)` }}>
      <div style={{ transformOrigin: `${SYNTH_FRAME.x}px ${SYNTH_FRAME.y}px`, transform: `scale(${k})` }}>
        <Opening
          frame={frame}
          openAt={T.open}
          pill={MERGED_PILL}
          frameRect={SYNTH_FRAME}
          host={
            <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <LiveDot size={14} />
              <Host slug={SYNTH_SLUG} suffix={`.${HOST}`} size={30} weight={500} />
            </span>
          }
        >
          <PageView id="synth" f={frame} width={SYNTH_FRAME.w} />
          <KeptBadge frame={frame} />
          <PromptDrawer frame={frame} />
        </Opening>
        {remixes > 0 ? (
          <div style={{ position: "absolute", left: SYNTH_FRAME.x, top: PAGE_TOP + PAGE_H + 30, opacity: 1 - shrink }}>
            <Mono size={30}>
              {`Remixes ${[1, 2, 3].slice(0, remixes).join(" · ")}`}
            </Mono>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ExploreHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  // waits for the camera and for "Ideas travel." to clear
  const on = prog(frame, at(79.0), ms(500));
  const out = prog(frame, T.stack, ms(300));
  if (on <= 0) return null;
  const chips: ("All" | Model)[] = ["All", ...MODELS];
  return (
    <div style={{ position: "absolute", left: RAIL_X0, top: EXPLORE_Y + 130, opacity: on * (1 - out) }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: TYPE.displayL, letterSpacing: DISPLAY_TRACKING, lineHeight: DISPLAY_LEADING, color: c.text }}>
        Explore
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 36 }}>
        {chips.map((m) => {
          const active = frame >= T.filter ? m === FILTER : m === "All";
          return (
            <Chip key={m} tone={active ? "accent" : "surface"} size={22}>
              {m}
            </Chip>
          );
        })}
      </div>
      <div style={{ marginTop: 40, opacity: prog(frame, T.filter, ms(300)) }}>
        <Mono size={22} color={c.textSecondary}>{`Best of ${FILTER} this week`}</Mono>
      </div>
    </div>
  );
};

const ShareKit: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  const lift = prog(frame, T.kit, ms(500), EASE.camera);
  if (lift <= 0) return null;
  const split = prog(frame, T.kit + ms(500), ms(500), EASE.out);
  const stackP = prog(frame, T.stack, ms(400), EASE.camera);
  const from = railPos("synth", T.kit);
  const mid = { x: 1200, y: KIT.image.cy };
  const at2 = (target: { cx: number; cy: number }) => ({
    x: lerp(lerp(from.x, mid.x, lift), target.cx, split),
    y: lerp(lerp(from.y, mid.y, lift), target.cy, split),
  });
  const scrub = clamp((frame - (T.kit + ms(900))) / ms(2400));
  const card = (target: typeof KIT.image, h: number, children: React.ReactNode, label: string) => {
    const p = at2(target);
    const w = lerp(CARD_W, target.w, split);
    return (
      <div
        style={{
          position: "absolute",
          left: lerp(p.x, 1500, stackP) - w / 2,
          top: lerp(p.y, EXPLORE_Y + 560, stackP) - h / 2,
          width: w,
        }}
      >
        <div style={{ borderRadius: RF.lg, overflow: "hidden", boxShadow: shadow("lg", 1.6), border: `${HAIRLINE}px solid ${c.border}`, position: "relative" }}>
          {children}
        </div>
        <div style={{ marginTop: 16, opacity: split }}>
          <Mono size={20}>{label}</Mono>
        </div>
      </div>
    );
  };
  return (
    <>
      {card(
        KIT.image,
        (KIT.image.w * 630) / 1200,
        <div style={{ position: "relative" }}>
          <PageView id="synth" f={T.kit} width={lerp(CARD_W, KIT.image.w, split)} style={{ height: (lerp(CARD_W, KIT.image.w, split) * 630) / 1200 }} />
          {/* the page is the subject; kept's mark small in a corner — never the mascot */}
          <span style={{ position: "absolute", right: 16, bottom: 12, padding: "4px 10px", borderRadius: RF.sm, background: c.surface, opacity: split }}>
            <Wordmark size={20} />
          </span>
        </div>,
        "Preview image · 1200×630",
      )}
      {split > 0
        ? card(
            KIT.clip,
            (KIT.clip.w * 9) / 16 + 40,
            <div style={{ background: c.surface }}>
              <PageView id="synth" f={frame} width={KIT.clip.w} />
              <div style={{ height: 40, display: "flex", alignItems: "center", gap: 14, padding: "0 16px" }}>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: c.surfaceSunken, position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${scrub * 100}%`, borderRadius: 3, background: c.accent }} />
                  <div style={{ position: "absolute", left: `calc(${scrub * 100}% - 8px)`, top: -5, width: 16, height: 16, borderRadius: 8, background: c.accent }} />
                </div>
                <Mono size={16} upper={false}>{`0:0${Math.min(6, Math.floor(scrub * 6))}`}</Mono>
              </div>
            </div>,
            "Clip · 0:06",
          )
        : null}
    </>
  );
};

/* ───────────────────────────── cursor ───────────────────────────── */

const pageToLocal = (x: number, y: number) => ({ x: SYNTH_FRAME.x + x, y: PAGE_TOP + y });

function cursorAt(frame: number) {
  const chip = pageToLocal(1130, PAGE_H - 74);
  const remix = pageToLocal(1500, PAGE_H - 74);
  const keys = [
    { f: T.badge, x: 1700, y: 1200 },
    { f: T.chipClick, x: chip.x, y: chip.y, ease: EASE.camera },
    { f: T.remixClick - ms(700), x: chip.x + 60, y: chip.y + 40 },
    { f: T.remixClick, x: remix.x, y: remix.y, ease: EASE.camera },
    { f: T.remixClick + ms(900), x: remix.x + 120, y: remix.y + 260 },
  ];
  const click = (t: number) => (frame >= t - ms(80) && frame < t + ms(80) ? 1 : 0);
  return {
    x: track(frame, keys, "x"),
    y: track(frame, keys, "y"),
    press: Math.max(click(T.chipClick), click(T.remixClick)),
    o: prog(frame, T.badge, ms(300)) * (1 - prog(frame, T.remixClick + ms(900), ms(300))),
  };
}

export const Act4World: React.FC = () => {
  const frame = useCurrentFrame();
  const cur = cursorAt(frame);
  return (
    <>
      <Tree frame={frame} />
      <SynthFrame frame={frame} />
      <ExploreHeader frame={frame} />
      <Cards frame={frame} />
      <ShareKit frame={frame} />
      {cur.o > 0 ? <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.o} /> : null}
    </>
  );
};

export const Act4Overlay: React.FC = () => (
  <>
    <SuperAt id="showHow" x={96} y={380} size={84} width={700} />
    <SuperAt id="sharePrompt" x={96} y={380} size={72} width={720} />
    <SuperAt id="remix" x={96} y={360} size={TYPE.displayL} width={700} />
    <SuperAt id="ideas" x={96} y={500} size={TYPE.displayL} width={700} />
    <SuperAt id="explore" x={96} y={790} size={88} width={760} />
    <SuperAt id="ready" x={96} y={790} size={88} width={760} />
  </>
);
