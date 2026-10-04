import React from "react";
import { useCurrentFrame } from "remotion";
import { Check } from "lucide-react";
import { HOST, PROMPTS, SYNTH_SLUG, WAY_SLUGS } from "../copy";
import { Cursor } from "../components/Cursor";
import { BrowserFrame } from "../components/Frame";
import { SuperAt } from "../components/SuperAt";
import { Mono } from "../components/Type";
import { Button, Chip, DraftChip, FileCard, Host, LiveDot, typed } from "../components/ui";
import { PageView } from "../pages";
import type { PublishResponse } from "@kept/shared";
import { arc, clamp, lerp, prog, track } from "../system/anim";
import { DRAFT_TTL_DAYS, KEPT_PAGE_LIMIT } from "../system/product";
import { useTheme } from "../system/theme";
import { at, ms } from "../system/timeline";
import { EASE, FONT, HAIRLINE, RF, TYPE } from "../system/tokens";
import { measureText } from "@remotion/layout-utils";

/**
 * Act 3 — AGENTS (0:44–1:04). An agent publishes keylessly and hands the
 * human a claim link; the human keeps it. Then the three ways in.
 */

/* ───────────────────────────── the chat ───────────────────────────── */

const PANEL = { x: 860, y: 140, w: 960, h: 800 };
const PAD = 40;

/**
 * The publish response, shown exactly as the API returns it — field names
 * checked against the product's `publishResponseSchema` at compile time.
 * The claim token is masked; it is a bearer credential.
 */
const RESPONSE: Pick<PublishResponse, "live_url" | "claim_url" | "expires_in"> = {
  live_url: `https://${SYNTH_SLUG}.${HOST}`,
  claim_url: `https://app.${HOST}/keep/••••••••`,
  expires_in: `${DRAFT_TTL_DAYS}d`,
};
const JSON_LINES: [string, string][] = Object.entries(RESPONSE).map(([k, v]) => [k, v]);
const JSON_TEXT = ["{", ...JSON_LINES.map(([k, v], i) => `  "${k}": "${v}"${i < JSON_LINES.length - 1 ? "," : ""}`), "}"].join("\n");

const T = {
  panel: at(44.0),
  user: at(44.5),
  writing: at(46.0),
  tool: at(47.0),
  json: at(48.0),
  message: at(50.0),
  lift: at(53.5),
  press: at(54.5),
  claimOut: at(56.5),
  ways: at(57.0),
  resolve: at(60.0),
};

/** Token-coloured JSON (keys `--text-secondary`, strings `--text`). */
const JsonView: React.FC<{ shown: string }> = ({ shown }) => {
  const { c } = useTheme();
  const parts = shown.split(/("[^"]*"?)/g);
  return (
    <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 22, lineHeight: "34px", color: c.textMuted, whiteSpace: "pre" }}>
      {parts.map((p, i) => {
        if (!p.startsWith('"')) return <span key={i}>{p}</span>;
        const isKey = shown.slice(shown.indexOf(p) + p.length).trimStart().startsWith(":");
        return (
          <span key={i} style={{ color: isKey ? c.textSecondary : c.text }}>
            {p}
          </span>
        );
      })}
    </pre>
  );
};

const MESSAGE_1 = `It's live at ${SYNTH_SLUG}.${HOST}.`;
const MESSAGE_2 = `It's a ${DRAFT_TTL_DAYS}-day draft —`;
/**
 * The "keep it here" pill follows the second line's text. Measured (the font
 * is loaded before any frame renders) so the T3 flight starts exactly from it.
 */
const keepPill = () => ({
  x: PAD + measureText({ text: `${MESSAGE_2} `, fontFamily: "Inter", fontSize: 28, fontWeight: "400" }).width + 6,
  y: 690,
  w: 196,
  h: 46,
});

const ChatPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  const land = prog(frame, T.panel, ms(400), EASE.out);
  const leave = prog(frame, T.lift, ms(300), EASE.camera);
  if (land <= 0 || leave >= 1) return null;
  const user = typed(frame, T.user, T.user + ms(1100), PROMPTS.agent);
  const progress = prog(frame, T.writing, ms(900), EASE.linear);
  const tool = prog(frame, T.tool, ms(400), EASE.out);
  const json = typed(frame, T.json, T.json + ms(1800), JSON_TEXT, "json");
  const words1 = MESSAGE_1.split(" ");
  const msgP = clamp((frame - T.message) / ms(900));
  const wordsShown = Math.floor(msgP * (words1.length + 6));
  const line1 = words1.slice(0, wordsShown).join(" ");
  const line2On = wordsShown > words1.length;
  const pillOn = prog(frame, T.message + ms(800), ms(160));
  return (
    <div
      style={{
        position: "absolute",
        left: PANEL.x,
        top: PANEL.y + (1 - land) * 24 + leave * 60,
        width: PANEL.w,
        height: PANEL.h,
        borderRadius: RF.xl,
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: shadow("md", 1.6),
        opacity: land * (1 - leave),
        overflow: "hidden",
      }}
    >
      <div style={{ height: 84, display: "flex", alignItems: "center", padding: `0 ${PAD}px`, borderBottom: `${HAIRLINE}px solid ${c.border}` }}>
        <Mono size={22} color={c.textSecondary}>
          Agent
        </Mono>
      </div>
      {frame >= T.user ? (
        <div
          style={{
            position: "absolute",
            right: PAD,
            top: 112,
            maxWidth: 720,
            padding: "22px 30px",
            borderRadius: RF.xl,
            background: c.surfaceSunken,
            fontFamily: FONT.body,
            fontSize: 28,
            color: c.text,
            whiteSpace: "nowrap",
          }}
        >
          {user}
        </div>
      ) : null}
      {frame >= T.writing ? (
        <div style={{ position: "absolute", left: PAD, top: 232, right: PAD }}>
          <Mono size={22} color={c.textSecondary} upper={false}>
            {progress < 1 ? "Writing pocket-synth.html…" : "Wrote pocket-synth.html"}
          </Mono>
          <div style={{ marginTop: 14, height: HAIRLINE, background: c.border }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: c.textSecondary }} />
          </div>
        </div>
      ) : null}
      {tool > 0 ? (
        <div
          style={{
            position: "absolute",
            left: PAD,
            right: PAD,
            top: 296,
            padding: "22px 26px",
            borderRadius: RF.lg,
            background: c.surfaceSunken,
            border: `${HAIRLINE}px solid ${c.border}`,
            transform: `translateX(${(1 - tool) * -40}px)`,
            opacity: tool,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Mono size={24} color={c.text} upper={false}>
              publish_page
            </Mono>
            <span style={{ flex: 1 }} />
            <Chip tone="surface" size={18}>
              No key
            </Chip>
            <Chip tone="surface" size={18}>
              No account
            </Chip>
          </div>
          <div style={{ marginTop: 14 }}>
            <Mono size={20} upper={false}>
              {"html: <!doctype html>… 41 KB"}
            </Mono>
          </div>
        </div>
      ) : null}
      {frame >= T.json ? (
        <div style={{ position: "absolute", left: PAD, top: 456 }}>
          <JsonView shown={json} />
        </div>
      ) : null}
      {frame >= T.message ? (
        <div style={{ position: "absolute", left: PAD, right: PAD, top: 642, fontFamily: FONT.body, fontSize: 28, color: c.text }}>
          <div>{line1}</div>
          {line2On ? (
            <div style={{ position: "absolute", left: 0, top: keepPill().y - 642 + 4 }}>{MESSAGE_2}</div>
          ) : null}
        </div>
      ) : null}
      {pillOn > 0 && frame < T.lift ? <KeepPill o={pillOn} /> : null}
    </div>
  );
};

const KeepPill: React.FC<{ o: number }> = ({ o }) => {
  const { c } = useTheme();
  const pill = keepPill();
  return (
    <span
      style={{
        position: "absolute",
        left: pill.x,
        top: pill.y,
        width: pill.w,
        height: pill.h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: RF.pill,
        background: c.accentSoft,
        color: c.accent,
        fontFamily: FONT.body,
        fontWeight: 500,
        fontSize: 26,
        opacity: o,
      }}
    >
      keep it here
    </span>
  );
};

/* ───────────────────────── the claim screen ───────────────────────── */

const CLAIM = { x: 910, y: 86, w: 860, pad: 48 };
const PREVIEW_W = CLAIM.w - CLAIM.pad * 2;
const BUTTON = { x: CLAIM.x + CLAIM.pad, y: CLAIM.y + 770, w: PREVIEW_W, h: 66 };

/** `/keep/[anonToken]`, its copy from the product (`app/keep/[anonToken]/page.tsx`). */
const ClaimScreen: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  const appear = prog(frame, T.lift + ms(250), ms(350), EASE.out);
  const out = prog(frame, T.claimOut, ms(400), EASE.camera);
  if (appear <= 0 || out >= 1) return null;
  const kept = frame >= T.press;
  const pop = prog(frame, T.press, ms(400), EASE.spring);
  const press = frame >= T.press - ms(80) && frame < T.press + ms(80) ? 1 : 0;
  const toast = prog(frame, T.press + ms(200), ms(300), EASE.spring) * (1 - prog(frame, T.claimOut - ms(300), ms(300)));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CLAIM.x,
          top: CLAIM.y + (1 - appear) * 30 - out * 60,
          width: CLAIM.w,
          padding: CLAIM.pad,
          boxSizing: "border-box",
          borderRadius: RF.xl,
          background: c.surface,
          border: `${HAIRLINE}px solid ${c.border}`,
          boxShadow: shadow("md", 1.6),
          opacity: appear * (1 - out),
        }}
      >
        <Mono size={20} color={c.textSecondary}>
          Someone shared this page with you
        </Mono>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", color: c.text, margin: "14px 0 26px" }}>
          {kept ? "This page is kept" : "It is live — but not permanent yet"}
        </div>
        <BrowserFrame w={PREVIEW_W} pageH={(PREVIEW_W * 9) / 16} host={`${SYNTH_SLUG}.${HOST}`} hostSize={20} shadow="sm">
          <PageView id="synth" f={frame} width={PREVIEW_W} />
        </BrowserFrame>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, margin: "24px 0", height: 40 }}>
          {kept ? <LiveDot size={14} ignite={pop} ring={clamp((frame - T.press) / ms(700))} /> : null}
          <DraftChip phase={kept ? "kept" : "draft"} />
        </div>
        <div style={{ height: BUTTON.h }} />
        <div style={{ marginTop: 18, textAlign: "center", fontFamily: FONT.body, fontSize: 19, color: c.textSecondary }}>
          {`Free. Sign in with GitHub, Google, or email — free accounts keep ${KEPT_PAGE_LIMIT} pages.`}
        </div>
      </div>
      {frame >= T.lift + ms(500) ? (
        <div
          style={{
            position: "absolute",
            left: BUTTON.x,
            top: BUTTON.y - out * 60,
            width: BUTTON.w,
            opacity: 1 - out,
            transform: `scale(${kept ? lerp(1.04, 1, pop) : 1})`,
          }}
        >
          {/* once kept, the claim screen's kept phase: a quiet "Publish a page of your own" */}
          {frame < T.press + ms(300) ? (
            <Button press={press} size={28} style={{ width: "100%", boxSizing: "border-box", height: BUTTON.h }}>
              Keep it forever
            </Button>
          ) : (
            <Button variant="secondary" size={28} style={{ width: "100%", boxSizing: "border-box", height: BUTTON.h }}>
              Publish a page of your own
            </Button>
          )}
        </div>
      ) : null}
      {toast > 0 ? (
        <div
          style={{
            position: "absolute",
            left: CLAIM.x + CLAIM.w / 2,
            top: 30,
            transform: `translate(-50%, ${(1 - toast) * -30}px)`,
            opacity: clamp(toast),
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 28px",
            borderRadius: RF.lg,
            background: c.surface,
            border: `${HAIRLINE}px solid ${c.border}`,
            boxShadow: shadow("lg", 1.6),
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 30,
            color: c.text,
            whiteSpace: "nowrap",
          }}
        >
          <Check size={30} color={c.accent} strokeWidth={2.4} />
          Kept forever
        </div>
      ) : null}
    </>
  );
};

/** T3: the chat's "keep it here" pill lifts, arcs right and grows into the claim screen's button. */
const PillFlight: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  if (frame < T.lift || frame >= T.lift + ms(500)) return null;
  const pill = keepPill();
  const p = prog(frame, T.lift, ms(500), EASE.camera);
  const x0 = PANEL.x + pill.x + pill.w / 2;
  const y0 = PANEL.y + pill.y + pill.h / 2;
  const pt = arc(p, x0, y0, BUTTON.x + BUTTON.w / 2, BUTTON.y + BUTTON.h / 2, 120);
  const w = lerp(pill.w, BUTTON.w, p);
  const h = lerp(pill.h, BUTTON.h, p);
  return (
    <div
      style={{
        position: "absolute",
        left: pt.x - w / 2,
        top: pt.y - h / 2,
        width: w,
        height: h,
        borderRadius: lerp(RF.pill, RF.md, p),
        background: p < 0.5 ? c.accentSoft : c.accent,
        boxShadow: shadow("lg", 1.6),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT.body,
        fontWeight: 500,
        fontSize: lerp(26, 28, p),
        color: p < 0.5 ? c.accent : c.onAccent,
        whiteSpace: "nowrap",
      }}
    >
      {p < 0.5 ? "keep it here" : "Keep it forever"}
    </div>
  );
};

/* ─────────────────────────── three ways in ─────────────────────────── */

const COLS = [320, 960, 1600];
const WAY_LABELS = ["Drop a file", "Paste HTML", "Ask your agent"];
const WAY_Y = 520;
/** The merged pill (opens into the synth at 1:02.0). */
export const MERGED_PILL = { cx: 960, cy: 600, w: 640 };

const WaysOfMaking: React.FC<{ frame: number }> = ({ frame }) => {
  const { c, shadow } = useTheme();
  if (frame < T.ways) return null;
  const lines = prog(frame, T.ways, ms(500), EASE.out);
  const linesOut = prog(frame, T.resolve, ms(400), EASE.camera);
  const content = 1 - prog(frame, T.resolve, ms(240));
  const pillIn = prog(frame, T.resolve, ms(300), EASE.spring);
  const merge = prog(frame, T.resolve + ms(400), ms(600), EASE.camera);
  return (
    <>
      {[640, 1280].map((x) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x,
            top: linesOut * 1080,
            width: HAIRLINE,
            height: (lines - linesOut) * 1080,
            background: c.border,
          }}
        />
      ))}
      {content > 0
        ? COLS.map((cx, i) => (
            <div key={i} style={{ position: "absolute", left: cx - 220, top: 0, width: 440, opacity: content }}>
              <div style={{ position: "absolute", top: 250, width: 440, textAlign: "center", opacity: prog(frame, T.ways + ms(200), ms(300)) }}>
                <Mono size={22} color={c.textSecondary}>
                  {WAY_LABELS[i]}
                </Mono>
              </div>
              <div style={{ position: "absolute", top: WAY_Y - 130, width: 440, height: 260, transform: "scale(1.3)", transformOrigin: "50% 40%" }}>
                {i === 0 ? <WayDrop frame={frame} /> : i === 1 ? <WayPaste frame={frame} /> : <WayAgent frame={frame} />}
              </div>
            </div>
          ))
        : null}
      {pillIn > 0 && frame < at(62.0) + ms(240)
        ? COLS.map((cx, i) => {
            // three links, then one: the outer two slide in and merge into the middle
            const x = lerp(cx, MERGED_PILL.cx, merge);
            const y = lerp(WAY_Y, MERGED_PILL.cy, merge);
            const o = i === 1 ? 1 : 1 - prog(frame, T.resolve + ms(800), ms(200));
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) scale(${lerp(0.9, 1, pillIn)})`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 16,
                  height: 100,
                  padding: "0 36px",
                  borderRadius: RF.pill,
                  background: c.surface,
                  border: `${HAIRLINE}px solid ${c.border}`,
                  boxShadow: shadow("md", 1.6),
                  opacity: o * (1 - prog(frame, at(62.0), ms(200))),
                  zIndex: i === 1 ? 2 : 1,
                }}
              >
                <LiveDot size={16} ring={clamp((frame - T.resolve) / ms(700))} />
                <Host slug={WAY_SLUGS[i]!} size={34} />
              </div>
            );
          })
        : null}
    </>
  );
};

const MiniTile: React.FC<{ active: number; children?: React.ReactNode }> = ({ active, children }) => {
  const { c } = useTheme();
  return (
    <div
      style={{
        position: "absolute",
        inset: "20px 30px",
        borderRadius: RF.lg,
        border: `3px ${active > 0.5 ? "solid" : "dashed"} ${c.accent}`,
        background: active > 0.5 ? c.accentSoft : c.surface,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 22,
        boxSizing: "border-box",
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: 22,
        color: c.text,
      }}
    >
      {children}
    </div>
  );
};

const WayDrop: React.FC<{ frame: number }> = ({ frame }) => {
  const fall = prog(frame, at(57.5), ms(700), (t) => t * t);
  const landed = frame >= at(57.5) + ms(700);
  return (
    <>
      <MiniTile active={landed ? 1 : 0}>{landed ? "Keeping it…" : "Drop your HTML"}</MiniTile>
      {!landed ? (
        <div style={{ position: "absolute", left: 220, top: lerp(-260, 80, fall), transform: "translateX(-50%) scale(0.62)" }}>
          <FileCard id="aquarium" f={frame} lift={1} />
        </div>
      ) : null}
    </>
  );
};

const WayPaste: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  const pasted = frame >= at(58.0);
  const busy = frame >= at(58.75);
  return (
    <div
      style={{
        position: "absolute",
        inset: "20px 30px",
        borderRadius: RF.lg,
        border: `${HAIRLINE}px solid ${c.border}`,
        background: c.surface,
        overflow: "hidden",
        padding: 18,
        boxSizing: "border-box",
      }}
    >
      {pasted ? (
        <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 12, lineHeight: "17px", color: c.textSecondary }}>
          {"<!doctype html>\n<html><head><title>rhine</title>\n<style>body{background:#e8f3f1}\n.chart{stroke:#1a9e8f}</style>\n</head><body><h1>Is the Rhine\nhigh today?</h1><svg class=chart>…"}
        </pre>
      ) : (
        <span style={{ fontFamily: FONT.body, fontSize: 22, color: c.textMuted }}>Paste HTML anywhere</span>
      )}
      {busy ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center", fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: c.text }}>
          Keeping it…
        </div>
      ) : null}
    </div>
  );
};

const WayAgent: React.FC<{ frame: number }> = ({ frame }) => {
  const { c } = useTheme();
  const ask = typed(frame, at(57.5), at(58.25), "put this online");
  const done = frame >= at(58.75);
  return (
    <div
      style={{
        position: "absolute",
        inset: "20px 30px",
        borderRadius: RF.lg,
        border: `${HAIRLINE}px solid ${c.border}`,
        background: c.surface,
        padding: 22,
        boxSizing: "border-box",
      }}
    >
      <Mono size={16} color={c.textSecondary}>
        Agent
      </Mono>
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 64,
          padding: "12px 18px",
          borderRadius: RF.lg,
          background: c.surfaceSunken,
          fontFamily: FONT.body,
          fontSize: 22,
          color: c.text,
          opacity: ask ? 1 : 0,
        }}
      >
        {ask}
      </div>
      {done ? (
        <div style={{ position: "absolute", left: 22, top: 150, display: "flex", alignItems: "center", gap: 10 }}>
          <Check size={22} color={c.live} strokeWidth={2.4} />
          <Mono size={20} color={c.text} upper={false}>
            publish_page
          </Mono>
        </div>
      ) : null}
    </div>
  );
};

/* ───────────────────────────── cursor ───────────────────────────── */

function cursorAt(frame: number) {
  const btn = { x: BUTTON.x + BUTTON.w / 2 + 40, y: BUTTON.y + BUTTON.h / 2 + 8 };
  const keys = [
    { f: T.lift, x: 1500, y: 1140 },
    { f: T.press - ms(100), x: btn.x, y: btn.y, ease: EASE.camera },
    { f: T.press + ms(600), x: btn.x + 60, y: btn.y + 90 },
    { f: T.claimOut + ms(400), x: btn.x + 300, y: 1160, ease: EASE.camera },
  ];
  const press = frame >= T.press - ms(80) && frame < T.press + ms(80) ? 1 : 0;
  return { x: track(frame, keys, "x"), y: track(frame, keys, "y"), press };
}

export const Act3World: React.FC = () => {
  const frame = useCurrentFrame();
  const cur = cursorAt(frame);
  return (
    <>
      <ChatPanel frame={frame} />
      <ClaimScreen frame={frame} />
      <PillFlight frame={frame} />
      <WaysOfMaking frame={frame} />
      {frame >= T.lift && frame < T.claimOut + ms(500) ? <Cursor x={cur.x} y={cur.y} press={cur.press} /> : null}
    </>
  );
};

export const Act3Overlay: React.FC = () => (
  <>
    <SuperAt id="agentPublishes" x={96} y={300} size={96} width={700} />
    <SuperAt id="youKeep" x={96} y={540} size={96} width={700} />
    <SuperAt id="howeverMade" x={960} y={290} size={TYPE.displayL} width={1300} align="center" />
  </>
);
