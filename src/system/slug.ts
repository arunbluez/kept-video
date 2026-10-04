import { slugSchema } from "@kept/shared";
import { SLUG_ALPHABET, SLUG_LENGTH, containsProfanity, isReservedSlug } from "@kept/slug";
import { rng } from "./anim";

/**
 * An anonymous slug exactly as the product mints one (`apps/web/lib/publish/
 * slug.ts`): `SLUG_LENGTH` characters of the product's Crockford alphabet,
 * never reserved, never profane, valid against `slugSchema`. The only change is
 * the entropy source — a seeded PRNG instead of the CSPRNG — so the film shows
 * the same URL on every render.
 */
export function filmSlug(seed: number): string {
  const r = rng(seed);
  for (let attempt = 0; attempt < 64; attempt++) {
    let slug = "";
    for (let i = 0; i < SLUG_LENGTH; i++) slug += SLUG_ALPHABET[Math.floor(r() * SLUG_ALPHABET.length)];
    if (isReservedSlug(slug) || containsProfanity(slug)) continue;
    if (slugSchema.safeParse(slug).success) return slug;
  }
  throw new Error(`filmSlug: no acceptable slug for seed ${seed}`);
}
