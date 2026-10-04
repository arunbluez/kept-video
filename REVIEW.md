# Review notes

What was built, where it departs from the brief and why, and what needs a
decision before the final render. Claims are in [CLAIMS.md](CLAIMS.md).

## 0. The brief arrived cut off

The pasted brief ends mid-§7, at Act 5, 1:31 ("…each snapping into its cell
with spring + a"). **§8 (sample pages), §9 (supers), §10 (sound), §11 (build),
§12 (deliverables), §13 (acceptance), §14 (claims format) and §15 (the six open
items) never arrived.** Everything after 1:31 is reconstructed from the brief's
own outline (§3 concept, §6 timeline and music map, the chapter names, the
mascot's arc, T3/T5/T6 uses), and so are those sections. Reconstructions are
marked below. Please send the rest of the brief if it exists — §9 and §15 most of all.

## 1. Where the film lives

The brief expected `tools/film/` inside the kept monorepo; the task came with
its own repo, `arunbluez/kept-video`, so the Remotion project is at its root.
The product is a **git submodule at `kept/`**, pinned to `develop@17979b9`. The
film imports product code directly instead of copying it:

| From the product | Used for |
|---|---|
| `@kept/shared/mascot` (`mascotFrame`, `gazeToward`, `MASCOT_REST_T`) | the mascot, every frame |
| `@kept/shared` (`publishResponseSchema`, `slugSchema`, `DRAFT_TTL_DAYS`, `DRAFT_GRACE_DAYS`, `KEPT_PAGE_LIMIT`) | the agent JSON (type-checked), slug validation, every number on screen |
| `apps/web/lib/publish/slug.ts` (`SLUG_ALPHABET`, `SLUG_LENGTH`, reserved/profanity filters) | minting the film's anonymous slugs, from a seeded source |
| `apps/web/components/kept/draft-chip.tsx` (`draftCountdown`) | the chip labels |

`git submodule update --init` is needed after cloning (the README says so).

## 2. Code vs brief — the code won (brief §2)

| Brief said | Product does | Film |
|---|---|---|
| Display **Hanken Grotesk**, body **Geist** | `lib/fonts.ts` + `globals.css`: **Geist** display, **Inter** body, JetBrains Mono (CLAUDE.md's "locked decisions" still say Hanken — stale) | Geist / Inter / JetBrains Mono, self-hosted from npm |
| Tile: `--surface-sunken`, dashed `--border`, `↑ Drop a file or browse`, dragover scale 1.02 | Tile faces: upload glyph, *Drop your HTML*, chip `yourpage.kept.host`, dashed **accent** border; dragover *Release to keep it*, scale **1.14**; minting *Keeping it…* | Product faces, copy and scale. The product's violet glow and radial-gradient fills are **dropped** — §4.6 forbids glows and gradients |
| Draft countdown `6d 23h`, chip settles as **Kept** | `draftCountdown`: *Draft · 7 days left*, *Kept · permanent* | Product labels. The badge's *keep it forever →* CTA is the brief's (no badge exists in code) |
| Frame: "kept-styled browser" | `PagePreview`: three hairline dots + mono host | `PagePreview`'s design, at film scale |
| Toast **Kept.** | The keep result screen's heading is *Kept forever* | *Kept forever* |
| `live_url: https://pocket-synth.kept.host` | Keyless publish mints a **random** slug; readable names are the (unbuilt) rename | A random slug (`t52smfgc.kept.host`), in the JSON and the agent's message |
| `orrery.html · 38 KB` | — | The film streams the orrery's **real** source, so it shows its real size (3 KB) |
| `PASTED · 1,204 LINES` | — | The real line count of that source (58) |
| Claim button: "real label from `app/keep/[anonToken]/`" | *Keep it forever* | as code; after the keep, the claim screen's kept phase (*This page is kept*, *Publish a page of your own*) |

## 3. Conflicts inside the brief, and how they were resolved

- **Act 1 vignettes moved one beat earlier** (13.0 / 15.0 / 17.0, out at 19.0; brief 13.5 / 15.5 / 17.5 / 19.5). At the brief's times *Pasted code isn't a launch.* gets 2.0 s of its own 2.45 s minimum, and the vignettes collide with the 0:19.5 super.
- **No account.** at **0:29.5** (brief 0:30.0) — at 0:30.0 it gets 1.25 s of its 1.7 s minimum before the 0:31 push.
- *Live in seconds.* / *No account.* exit at 0:30.75; *However it's made.* at 1:01.5; *Make a wall of your work.* at 1:34.0 — each so a super never sits on a vivid page.
- **Whip #2 lasts two beats** (1:25.0–1:26.0) so it lands on Act 5's downbeat; whips #1 and #3 are one beat.
- The 0:22 **T1**: the hairline that wipes *Your work deserves a link.* is the same line that reveals the tile.
- On-screen time is measured from the first word's rise to the end of the exit wipe; `pnpm check` verifies every super.

## 4. Film extensions (logged as asked)

- `ease-camera` = `bezier(0.65, 0, 0.35, 1)` for camera travel (brief §4.5).
- `--ease-spring` beyond drop / mint / keep / mascot rise: **wall snaps** (brief-sanctioned), the **finale grid snaps**, the wall's drag-and-drop, and remix cards' landing.
- The finale grid lands on **sixteenths** (the wall uses eighths) — the "final lift".
- Motion blur only inside the three whip windows (`CameraMotionBlur`, 180°, 10 samples).

## 5. Reconstructed after 1:31

**Act 5 (to 1:48):** super *Make a wall / of your work.* (1:31.5); a tilted flyover of the wall (1:34–1:38, ≤ 10°); the cursor drags one block to another cell and the two swap (1:38–1:39, `DRAG TO ARRANGE`); **T3 frame → phone** (1:41); super *One link / for everything.* with `MIRA.KEPT.HOST` (1:41.5); the phone column scrolls; whip at 1:47.5.

**Act 6 OPEN (1:48–2:12):** the edge's real expired page in a frame, mascot `dim`, super *A draft / lasts a week.* `7 DAYS LIVE · 30 DAYS TO RECOVER`; **T5 light → dark** 1:52–1:56 as the draft lapses; the orrery, now `orrery.kept.host`, *Kept · permanent*, super *A kept page / stays.*; `STILL LIVE · 2026 → 2046` (1:56–1:58); super *Built to / outlast us.* with the /promise quote (1:58); super *Open source. / Open books.* with the landing's open-books dot field and its three reasons (2:03); **T5 dark → light** 2:08.5–2:11.5.

**Act 7 KEPT (2:12–2:30):** twenty pages from the film snap into one grid on sixteenths, the plane tilting back as the camera pulls away; the centre stays empty; **the mascot rises** into it (2:16), bobbing with the product's own ±3% / 6 s hover, breathing and blinking on the generator's schedule; the cursor circles and the eyes follow (product gaze maths); the grid recedes (2:19, HUD off); super *Made with AI. / **Kept** by you.* (2:20) and `kept.host` (2:23); the cursor leaves bottom-right and the mascot watches it go (2:24.5); hold to 2:30.

Violet words: *link* (0:19.5), *forever* (0:38), *keep* (0:53), *Kept* (2:20) — 4 of the allowed 5.

## 6. Sound

No track was supplied, so `scripts/audio.ts` synthesises a **temp bed** in the
§6 shape — sparse intro, build and riser, the drop at 0:22, groove, peak at 1:26,
breakdown at 1:48, final lift at 2:12, resolve and tail — at 120 BPM from frame
0. **It must not be published.** The pocket synth's lit pads are `SYNTH_STEPS`,
which the bed plays; the drums play the drum-machine remix's grid (`DRUM_ROWS`).
SFX (key ticks, thock, sand pour, mint chime, clicks, snaps, whooshes, the keep
spring) are mixed from `src/system/cues.ts`. The render is mastered to −14 LUFS
/ −1 dBTP. I could not listen to the result in this environment; the
waveform, spectrogram and per-section loudness were checked instead.

With the licensed track: drop it at `public/audio/music.wav` (it is picked up
automatically), set `BPM` and `DOWNBEAT_OFFSET` in `src/system/timeline.ts` if
its grid differs, and re-render. Every hit, the synth lights and the platformer
re-time from those two numbers.

## 7. Visual QA

Stills were rendered and looked at after every act (`pnpm stills --act N`, or
seconds), and fixed where they failed: file names wrapping in cards; the tile
reveal fighting the exiting super; the dragged card hiding *Release to keep it*;
the address bar arriving empty mid-morph; the agent chat's pill indent (now
measured); chat and claim screen ghosting through each other; the toast
wrapping; Explore's header colliding with an exiting super; the rail cluttering
the share kit; the wall super sitting on blocks during the flyover. Frames pulled
from the first full render then showed two whips landing on near-empty canvas,
so Mira's header is up as whip #2 lands (1:26.0) and the lapsed draft is already
in place when whip #3 lands (1:48.0). The
contact sheet (`out/contact-sheet.png`, one still per bar) is the overview.

## 8. Technical notes

- Remotion 4.0.532. It warns that `zod` should be 4.5.4; the film keeps
  **zod 3** because `@kept/shared` is written against it, and the film uses no
  Remotion zod-typed props.
- Renders use the environment's pre-installed `chrome-headless-shell`
  (`remotion.config.ts`); set `REMOTION_BROWSER_EXECUTABLE` elsewhere, or unset
  both to let Remotion download its own.
- Encode: PNG frames → H.264 CRF 16, `yuv420p`, TV range, tagged BT.709 (JPEG
  frames had landed the first render in full-range `yuvj420p`, which some
  players show with shifted contrast). Audio AAC 320k, 48 kHz, loudness-normalised
  to −14 LUFS with a −1.5 dBTP ceiling going into the encoder (the first render's
  −1 dBTP ceiling came out at −0.7 after AAC).
- Everything is deterministic: seeded PRNG for every jitter, typing rhythm, slug,
  glyph and grain.

## 9. The 60-second cut

`KeptFilm60` is an **edit** of the film, not a re-animation: four continuous
stretches (`src/cut60.ts`), each starting and ending on a bar line, joined by an
eighth-note hairline wipe (T1). Because it plays the film's own frames, it can't
drift from it, and the music and SFX are conformed with the same edit list so
every hit stays on the beat.

| Cut | Film | Beat |
|---|---|---|
| 0:00–0:06 | 0:06–0:12 | AI makes pages now. Good ones. |
| 0:06–0:30 | 0:16–0:40 | stuck → *Your work deserves a link.* → drop, mint, *Live in seconds. No account.* → draft → *Kept — forever.* |
| 0:30–0:48 | 0:48–1:06 | *Your agent publishes. You keep it.* → three ways in → *However it's made.* → the synth |
| 0:48–1:00 | 2:14–2:26 | every page on one grid → the mascot → *Made with AI. Kept by you.* · `kept.host` |

- The cut leaves out remix, Explore, the share kit, walls and the rename, so it
  only claims shipped behaviour. The one exception is the on-page draft badge
  (0:24–0:30); see CLAIMS.md.
- It leaves out the dark passage too: cutting into or out of it would flip the
  theme, which the brief forbids. `pnpm check` asserts no theme change across a cut.
- The HUD shows the cut's own timecode and renumbers chapters (00 MADE … 05 KEPT).
- Every super the cut shows still holds its minimum time (checked), and the
  cut contains no whip.
- Implementation note: the cut maps its clock onto the film's with an offset
  `Sequence`, not `Freeze`. Freeze clamps to the 60 s composition's length, which
  froze the picture at 0:59.98 of film time in the first test render.
- The optional VO (`VO_LINES` in `src/copy.ts`) plays from `public/audio/vo/`
  when the files exist, with the music ducking under it. See AUDIO.md.

## 10. Before the final render — open items (my guess at §15)

1. **Music.** Licensed 120 BPM track at `public/audio/music.wav`; adjust `BPM` / `DOWNBEAT_OFFSET`; re-render.
2. **Unbuilt features on screen** (CLAIMS.md): badge, rename, provenance, remix, Explore, share kit, walls, the MCP tool. Ship as-is, mark as coming, or cut — your call per feature.
3. **`{model}` names** (`MODELS` in `src/copy.ts`): real model family names, plain text, alphabetical. Brand/legal sign-off, or neutral labels.
4. **The reconstructed supers and Acts 5–7 choreography** — sign-off, or send §9.
5. **`STILL LIVE · 2046`** and the **2.4 s** mint counter — keep, soften, or cut.
6. **Type**: confirm Geist / Inter (what ships) over the brief's Hanken Grotesk / Geist.
