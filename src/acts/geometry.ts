/**
 * Scene geometry that both a scene and the camera path need, kept apart from
 * the scene components so the camera path never imports a component.
 * All region-local.
 */

/** Act 5: Mira's wall frame, and the phone it folds into. */
export const WALL = { x: 1020, y: 80, w: 1800, pageH: 1700, bar: 72 };
export const PHONE = { x: 1700, y: 546, w: 440, h: 900 };
export const WALL_CENTRE = { x: WALL.x + WALL.w / 2, y: WALL.y + (WALL.bar + WALL.pageH) / 2 };
export const PHONE_CENTRE = { x: PHONE.x + PHONE.w / 2, y: PHONE.y + PHONE.h / 2 };
/** A point on the wall's page, from page coordinates. */
export const wallPoint = (px: number, py: number) => ({ x: WALL.x + px, y: WALL.y + WALL.bar + py });

/** Act 7: the finale grid's centre — where the mascot rises. Act 6's region. */
export const FINALE = { cx: 960, cy: 540 };
