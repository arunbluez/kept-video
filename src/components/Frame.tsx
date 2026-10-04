import React from "react";
import { useTheme } from "../system/theme";
import { FONT, HAIRLINE, MONO_TRACKING, RF } from "../system/tokens";

export const BAR_H = 72;

/**
 * The kept-styled frame around a page — the product's own `PagePreview`
 * (`components/kept/page-preview.tsx`): surface, hairline, `r-lg`, a sunken
 * bar with three hairline dots and the host in mono. Not a browser: no real
 * app's chrome is imitated (brief §4.6).
 */
export const BrowserFrame: React.FC<{
  w: number;
  pageH: number;
  host: React.ReactNode;
  children?: React.ReactNode;
  shadow?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
  /** 0→1 opacity of the frame chrome (bar contents + border), for match cuts. */
  chrome?: number;
  /** Host text size; larger where the film needs the address to read. */
  hostSize?: number;
}> = ({ w, pageH, host, children, shadow = "md", style, chrome = 1, hostSize = 24 }) => {
  const { c, shadow: sh } = useTheme();
  return (
    <div
      style={{
        width: w,
        height: pageH + BAR_H,
        borderRadius: RF.lg,
        overflow: "hidden",
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: sh(shadow, 1.6),
        boxSizing: "border-box",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          height: BAR_H,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "0 28px",
          background: c.surfaceSunken,
          borderBottom: `${HAIRLINE}px solid ${c.border}`,
          boxSizing: "border-box",
        }}
      >
        <span style={{ display: "flex", gap: 10, opacity: chrome }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c.border }} />
          ))}
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontWeight: 500,
            fontSize: hostSize,
            color: c.textMuted,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
        >
          {host}
        </span>
      </div>
      <div style={{ position: "relative", width: "100%", height: pageH, overflow: "hidden", background: c.bg }}>
        {children}
      </div>
    </div>
  );
};

/** The hosted-page badge (brief §7, doc 02 §13): solid surface pill, hairline, mono. */
export const PageBadge: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 22, style }) => {
  const { c, shadow } = useTheme();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.7,
        height: size * 2.3,
        padding: `0 ${size * 0.9}px`,
        borderRadius: RF.pill,
        background: c.surface,
        border: `${HAIRLINE}px solid ${c.border}`,
        boxShadow: shadow("md", 1.6),
        fontFamily: FONT.mono,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: MONO_TRACKING,
        color: c.textSecondary,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** The kept wordmark as the product sets it: Geist bold, tracking −0.03em, ink. */
export const Wordmark: React.FC<{ size: number; color?: string }> = ({ size, color }) => {
  const { c } = useTheme();
  return (
    <span
      style={{
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.03em",
        color: color ?? c.text,
        lineHeight: 1,
      }}
    >
      kept
    </span>
  );
};

/** A hairline divider inside a badge. */
export const BadgeRule: React.FC<{ h?: number }> = ({ h = 26 }) => {
  const { c } = useTheme();
  return <span style={{ width: HAIRLINE, height: h, background: c.border, flex: "none" }} />;
};
