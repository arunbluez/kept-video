# kept — launch film

A 150-second, 1920×1080, 60 fps product film for [kept](https://kept.host),
built as programmatic motion graphics in [Remotion](https://remotion.dev).
One infinite canvas, one camera, one link. Plus a **60-second cut** edited from
the same frames (`src/cut60.ts`).

- [REVIEW.md](REVIEW.md) — what was built, where it departs from the brief and why, open decisions
- [CLAIMS.md](CLAIMS.md) — every product claim in the film, checked against the product code
- [AUDIO.md](AUDIO.md) — replacing the temp music (ElevenLabs composition plans), the optional VO
- [elevenlabs/prompts.md](elevenlabs/prompts.md) — paste-ready ElevenLabs prompts: both music tracks, the VO for Eleven v4

> **The music in renders made from this repo is a synthesised temp bed and
> must not be published.** Drop real tracks at `public/audio/music.wav` (150 s)
> and `public/audio/music-60.wav` (60 s) — see [AUDIO.md](AUDIO.md).

## Setup

```bash
git submodule update --init   # the product, pinned at kept/ — the film imports its code
corepack enable && pnpm install
```

## Work

```bash
pnpm studio                   # Remotion Studio (compositions: KeptFilm, KeptFilm60, PageSheet)
pnpm stills 26.5 38 140       # stills at shot-list seconds → out/stills/<run>/, tile → out/tile.png
pnpm stills --act 2           # one still every 1.5 s through an act
pnpm stills --sheet           # one still per bar → out/contact-sheet.png
pnpm audio                    # regenerate public/audio/temp-bed.wav + sfx.wav
pnpm render                   # audio → render → master (−14 LUFS) → out/kept-launch-film.mp4
pnpm vo take.wav              # split a VO take into public/audio/vo/ and check each line fits (AUDIO.md)
pnpm render:60                # the 60 s cut → out/kept-launch-film-60.mp4
pnpm stills --comp KeptFilm60 12 30   # stills of the 60 s cut, at its own seconds
pnpm check                    # acceptance checks (source rules + the render)
pnpm typecheck && pnpm lint
```

## Layout

```
src/
  Film.tsx              the 150 s composition: picture + HUD + sound
  FilmShort.tsx         the 60 s composition: the same picture through the cut60 edit, hairline-wipe cuts, VO
  FilmPicture.tsx       the picture both share: world plane under one camera, supers
  cut60.ts              the 60 s edit list — four bar-aligned stretches of the film
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
elevenlabs/             composition plans for generating the real music
scripts/                audio synthesis, VO split/measure, stills, mastering, checks
kept/                   the product (submodule)
```
