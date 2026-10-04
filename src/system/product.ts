/**
 * Product facts the film shows, read from the product itself (the pinned
 * `kept/` submodule) so a constant changing there changes the film.
 */
export { DRAFT_GRACE_DAYS, DRAFT_TTL_DAYS, KEPT_PAGE_LIMIT, publishResponseSchema } from "@kept/shared";
import { draftCountdown, type DraftPhase } from "@/components/kept/draft-chip";
import { DRAFT_TTL_DAYS } from "@kept/shared";

export type { DraftPhase };

const NOW = new Date("2026-10-04T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

/**
 * The draft chip's label for a phase, from the product's own `draftCountdown`:
 * a fresh draft ("Draft · 7 days left"), a kept page ("Kept · permanent"),
 * a lapsed one ("Draft · expired").
 */
export function draftLabel(phase: DraftPhase): string {
  const expiresAt =
    phase === "kept" ? null : phase === "draft" ? new Date(NOW.getTime() + DRAFT_TTL_DAYS * DAY - 60_000) : new Date(NOW.getTime() - DAY);
  return draftCountdown(expiresAt, NOW).label;
}
