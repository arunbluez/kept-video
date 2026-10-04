# kept — launch film

A 150-second, 1920×1080, 60 fps product film for [kept](https://kept.host),
built as programmatic motion graphics in [Remotion](https://remotion.dev).
One infinite canvas, one camera, one link.

- [REVIEW.md](REVIEW.md) — what was built, where it departs from the brief and why, open decisions
- [CLAIMS.md](CLAIMS.md) — every product claim in the film, checked against the product code

> **The music in renders made from this repo is a synthesised temp bed and
> must not be published.** Drop the licensed track at `public/audio/music.wav`.

## Setup

```bash
git submodule update --init   # the product, pinned at kept/ — the film imports its code
corepack enable && pnpm install
```

## Work

```bash
pnpm studio                   # Remotion Studio (compositions: KeptFilm, PageSheet)
pnpm stills 26.5 38 140       # stills at shot-list seconds → out/stills/<run>/, tile → out/tile.png
pnpm stills --act 2           # one still every 1.5 s through an act
pnpm stills --sheet           # one still per bar → out/contact-sheet.png
pnpm audio                    # regenerate public/audio/temp-bed.wav + sfx.wav
pnpm render                   # audio → render → master (−14 LUFS) → out/kept-launch-film.mp4
pnpm check                    # acceptance checks (source rules + the render)
pnpm typecheck && pnpm lint
```

## Layout

```
src/
  Film.tsx              the composition: world plane under one camera, supers, HUD, sound
  copy.ts               every super (text + timing), prompts, slugs, model names
  system/
    timeline.ts         the clock, in bars and beats — BPM and DOWNBEAT_OFFSET retime everything
    tokens.ts           kept's design tokens (the only hex outside src/pages/)
    camera.tsx          the camera; acts/camera-path.ts holds every move
    cues.ts             every SFX hit and typed-text window
    music.ts            the synth pattern and drum grid the pages and the bed share
  acts/Act0…Act7.tsx    one scene per chapter, each at a fixed region of the 7680×4320 world
  components/           type (supers, underline), frame, cursor, mascot, UI kit
  pages/                the AI-made sample pages — each a pure function of the frame
scripts/                audio synthesis, stills, mastering, checks
kept/                   the product (submodule)
```
