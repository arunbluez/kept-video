/** Every sample page renders at 1600×900 and is scaled by its container. */
export const PAGE_W = 1600;
export const PAGE_H = 900;

export interface PageProps {
  /** Absolute film frame. Pages are pure functions of it. */
  f: number;
}
