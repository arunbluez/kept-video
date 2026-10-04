/**
 * The one canvas (brief §3, §5.2): a 7680×4320 world — 4×4 cells of 1920×1080
 * — holding every scene at a fixed region. The camera travels between them.
 *
 *   col:    0            1            2            3
 *   row 0   A0 MADE      A1/A2 STUCK·DROP   A5 WALL (2×2) ─────┐
 *   row 1   A3/A4 AGENTS·SHARE              │                  │
 *   row 2   A4 (tree, explore, kit)         A6 OPEN / A7 KEPT ─┘
 *   row 3                                    (finale grid spills into row 3)
 */
export const CELL_W = 1920;
export const CELL_H = 1080;
export const WORLD_W = CELL_W * 4;
export const WORLD_H = CELL_H * 4;

const cell = (col: number, row: number) => ({ x: col * CELL_W, y: row * CELL_H });

/** Top-left of each act's region, in world pixels. */
export const REGION = {
  a0: cell(0, 0),
  a1: cell(1, 0),
  a3: cell(0, 1),
  a5: cell(2, 0),
  a6: cell(2, 2),
} as const;

export type Region = (typeof REGION)[keyof typeof REGION];
