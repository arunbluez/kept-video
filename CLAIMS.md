# Claims report

Every product claim the film makes, checked against the product code at
`kept-host/kept@17979b9` (the `develop` head pinned as the `kept/` submodule,
2026-08-21). Use this before publishing: anything not **Shipped** is a promise,
not a fact, on the day the film goes out.

**Shipped** = in the code today. **Partial** = the substance exists, the film
compresses or extends it. **Not built** = shown in the film, absent from code.

## Shipped

| Time | On screen | Evidence |
|---|---|---|
| 0:22–0:26 | The drop tile: *Drop your HTML* → *Release to keep it* → *Keeping it…* → live | `apps/web/components/kept/kept-engine.ts` (`applyPhase`, `TILE_FACE`), `KeptLanding.tsx` tile faces |
| 0:26.5 | An anonymous `{slug}.kept.host` link (8-char Crockford base32) | `apps/web/lib/publish/slug.ts`; slugs in the film are minted with its alphabet, length and filters |
| 0:27 | *Copy link* → *Copied* | `components/kept/live-url.tsx` |
| 0:29.5 | **No account.** | `POST /api/publish` is anonymous (`app/api/publish/route.ts`) |
| 0:34 | **Every page starts as a draft.** · `LIVE NOW · 7 DAYS TO KEEP IT` | `DRAFT_TTL_DAYS = 7` (`packages/shared/src/constants.ts`) |
| 0:37 | Sign-in step: *Keep this page*, Email, *Email me a magic link* | `app/auth/keep/page.tsx`, `app/auth/sign-in-form.tsx` |
| 0:38 | Chip *Draft · 7 days left* → *Kept · permanent* | `components/kept/draft-chip.tsx` (`draftCountdown`, imported by the film) |
| 0:48 | Publish response `live_url`, `claim_url`, `expires_in: "7d"`; claim link on `app.kept.host/keep/…` | `packages/shared/src/publish.ts` (`publishResponseSchema`, checked at compile time); `lib/publish/pipeline.ts` (`claimUrl`) |
| 0:53–0:55 | The claim screen and its *Keep it forever* button; kept phase *This page is kept* | `app/keep/[anonToken]/page.tsx` |
| 0:55 | `Free. … free accounts keep 3 pages.` | `KEPT_PAGE_LIMIT = 3` |
| 0:57–1:00 | Three ways in: drop a file, paste HTML, ask an agent (via the keyless API) | drop + paste in `kept-engine.ts`; `POST /api/publish` takes no key |
| 1:48 | The expired page: *This draft wasn't kept.*, *Recoverable for 30 days*, the dimmed mascot | `apps/edge/src/system-pages.ts` (`expiredBody`, mood `dim`) |
| 1:58 | The forever promise, quoted | `app/(marketing)/promise/page.tsx` — the **short placeholder** version; E09 will replace it, re-check the quote then |
| 2:01 | *Open source · AGPL* | `LICENSE` (AGPL-3.0) |
| 2:16 | The mascot (generator, gaze, bob, blink) | `packages/shared/src/mascot/` (drawn by the film directly), `components/kept/mascot.tsx` constants |

## Partial

| Time | On screen | What is true | What the film adds |
|---|---|---|---|
| 0:25–0:26.5 | Mint counter `0.0 S → 2.4 S`, **Live in seconds.** | Publishing is one request | The 2.4 s figure is illustrative, not measured. Measure p50 publish time before launch, or drop the number |
| 0:37–0:38 | Keep in one click | Keeping = sign in + attach (E05) | The magic-link round trip (open email, click) is skipped |
| 0:44–0:56 | An agent calls `publish_page` with `NO KEY · NO ACCOUNT` | The keyless publish API exists; the landing advertises the MCP tool | The MCP server is **E08, not built** ("MCP server · soon" in the footer). Today an agent can only do this with a raw HTTP call |
| 0:56 | `KEYLESS AGENT PUBLISHING · FREE FOREVER` | Keyless publish is free; API keys are Pro | "Free forever" is a pricing promise — confirm |
| 2:01–2:08 | Open-books dot field, *Every dot is a page kept online right now.*; *Costs in public · Math you can check* | The landing's copy, verbatim | The dots are illustrative, not live data; `/stats` is still a placeholder (E09) |
| 1:56–1:58 | `STILL LIVE · 2026 → 2046` year roll | Kept pages have no expiry (`expires_at = null`) | A forward-looking claim about 20 years — a metaphor, but it reads as a promise |

## Not built (shown as if it exists)

| Time | On screen | Status in code |
|---|---|---|
| 0:31–0:38, 1:06 | The on-page badge (draft: *keep it forever →*; kept: mark · *Made with {model}* · *Remix*) | No badge in `apps/edge`. The landing's Pro list mentions "Remove the kept badge", so one is planned |
| 0:40.5 | Rename to a readable name, `READABLE NAMES · FREE` | Rename is **E06** (dashboard copy says "E06 builds … rename"). The landing lists "rename slug" as a Free feature |
| 1:06–1:12 | Provenance chip *Made with {model}*, opt-in prompt drawer | Not in code or PRDs in this repo |
| 1:13–1:18 | Remix, remix counts, the family tree | Not in code |
| 1:18–1:21 | **Explore**, filtered by model, `BEST OF {MODEL} THIS WEEK` | **E10 public gallery (v1.5)** — not built |
| 1:21–1:25 | Share kit (1200×630 preview + clip), `SHARE KIT · PRO` | Not in the landing's Pro list (`PRO_FEATURES`) or code |
| 1:26–1:48 | Walls: `mira.kept.host`, blocks, drag to arrange, phone view | Not in code (would also need profile slugs and a layout editor) |

## Names and marks

- Model names in `copy.ts` (`MODELS`) are plain text — no logos — but they are
  real companies' product names attached to features that do not exist yet.
  Brand/legal sign-off needed, or swap for neutral labels in one place.
- No real app chrome, browser, chat app, OS or phone is imitated: frames are the
  product's own `PagePreview`, the phone is a plain rounded rectangle, the chat
  is kept-styled with the label `AGENT`.
- Persona: *Mira*, `mira.kept.host`, `mira@example.com` (a reserved example
  domain). `mira.kept.host` is a valid slug that someone could register.
