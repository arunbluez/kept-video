import React from "react";

/**
 * Pixel-art helpers for the two pixel pages. A sprite is rows of characters;
 * each character maps to a colour (space = transparent). Drawn as one SVG
 * path per colour so a 160×90 scene stays cheap to render every frame.
 */
export type Sprite = readonly string[];

/** Collect a sprite's pixels at a cell position into the per-colour buckets. */
export function stamp(
  out: Map<string, string[]>,
  sprite: Sprite,
  palette: Record<string, string>,
  cx: number,
  cy: number,
  flip = false,
): void {
  sprite.forEach((row, y) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[flip ? row.length - 1 - i : i]!;
      const color = palette[ch];
      if (!color) continue;
      push(out, color, Math.round(cx + i), Math.round(cy + y), 1, 1);
    }
  });
}

export function push(out: Map<string, string[]>, color: string, x: number, y: number, w: number, h: number): void {
  const list = out.get(color) ?? [];
  list.push(`M${x} ${y}h${w}v${h}h${-w}z`);
  out.set(color, list);
}

/** Render buckets at `cell` px per pixel. */
export const PixelCanvas: React.FC<{
  buckets: Map<string, string[]>;
  cols: number;
  rows: number;
  cell: number;
}> = ({ buckets, cols, rows, cell }) => (
  <svg
    width={cols * cell}
    height={rows * cell}
    viewBox={`0 0 ${cols} ${rows}`}
    shapeRendering="crispEdges"
    style={{ position: "absolute", inset: 0 }}
  >
    {[...buckets.entries()].map(([color, d]) => (
      <path key={color} d={d.join("")} fill={color} />
    ))}
  </svg>
);
