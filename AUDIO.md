# Audio: music and voice-over

Both cuts run at **120 BPM from frame 0**. Every cut, snap and super lands on
that grid, so the music has to as well.

## Status

The renders use the **ElevenLabs music takes** (`music-60.mp3`, `music-150.mp3`)
and the **one-take VO** (`vo.mp3`), all generated from `elevenlabs/prompts.md`.
None of them is committed. The music is ElevenLabs output under your plan's
terms and stays out of a public repo, so keep the original files. Without them,
the compositions fall back to a **temp bed** I synthesised in code. It keeps the
sync points honest, but it must not be published.

**Measured.** Both takes hold **120.00 BPM** for their full length, with the
downbeat ~20 ms after each even second, already on the film's grid. They
didn't put their sections where the prompts asked: the 60 s take's drop came
at 0:24 instead of 0:12, the 150 s take's at 0:16 instead of 0:22. The 150 s
take's second half matched on its own: the kick cuts out at 1:48 (the whip
lands at 1:48), the breakdown goes quiet at 1:52 (the picture turns dark at
1:52), and the lift starts at 2:10.

**Edited to picture** with `pnpm music` (`scripts/music.ts`). The edits are cut
on bar lines, and every seam joins bars that measured near-identical:

| Cut | Edit | Lands |
|---|---|---|
| 60 s | intro shortened to 3 bars; take bars 9–27 (kick, fill, the full drop); bars 10–13 again (build, fill, drop); bars 26–29 (the drop's end, the take's ending) | kick on the first cut 0:06 · **drop on the tile 0:12** · dip 0:44 · **second drop on the grid snap 0:48** · ending 0:56 |
| 150 s | 3 bars added to the intro (a repeat of bars 1–3); 3 groove bars (44–46) taken out before a break | **drop on the tile 0:22** · a break re-enters with the whip at **1:26** · from 1:34 on, the take at its own times |

```bash
pnpm music 60  music-60.mp3    # → public/audio/music-60.wav
pnpm music 150 music-150.mp3   # → public/audio/music.wav
pnpm vo vo.mp3                 # → public/audio/vo/vo-01.wav … vo-11.wav
pnpm render:60 && pnpm render
```

The edits are made for these two takes; `pnpm music` refuses a take of a
different length. A new take needs a new edit, so send it to me.

## 1. Music: generate it in ElevenLabs

A generated track can be told *where* its drop, lift and ending fall, so it
lands on the picture. A library track can't. ElevenLabs says Eleven Music is
"cleared for nearly all commercial uses"; check your plan against its
[music terms](https://elevenlabs.io/music-terms) before you publish.

**Paste-ready prompts for the ElevenLabs web app, for both cuts and the VO,
are in [`elevenlabs/prompts.md`](elevenlabs/prompts.md).** The JSON files below
hold the same structure as API composition plans, one per cut. Each section
starts on a bar line and lands on a visual hit:

| File | Cut | Sections (start) |
|---|---|---|
| [`elevenlabs/music-60.json`](elevenlabs/music-60.json) | 60 s | Hook 0:00 · Tension 0:06 · **Drop 0:12** (tile hit) · Groove B 0:30 (agents) · **Final lift 0:48** (grid snaps) · Resolve 0:54 (end card) |
| [`elevenlabs/music-150.json`](elevenlabs/music-150.json) | 150 s | Intro 0:00 · Build 0:12 · **Drop 0:22** · Groove 0:44 · Groove B 1:04 · **Peak 1:26** (the wall) · Breakdown 1:48 (dark passage) · Rebuild 2:08 · **Final lift 2:12** · Resolve 2:22 |

Every section carries the same base tags (`instrumental`, `120 BPM`, `4/4`,
`A minor`, minimal modern electronic, warm, calm but confident) so the track
holds together. The negative tags rule out vocals, orchestral, corporate
ukulele, EDM drops and tempo changes.

**Generate** with the API (the Music API is for paid plans), using the
official SDK:

```python
import json, os
from elevenlabs.client import ElevenLabs

eleven = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])
for name in ("music-60", "music-150"):
    plan = json.load(open(f"elevenlabs/{name}.json"))
    audio = eleven.music.compose(composition_plan=plan, model_id="music_v2_5")
    with open(f"{name}.mp3", "wb") as f:
        for chunk in audio:
            f.write(chunk)
```

You can also use the ElevenLabs Music UI: paste the section styles in as the
prompt, set the length to 60 s or 150 s, and ask for WAV. Generate two or three
takes per cut, and pick by ear.

**Drop in:**

```bash
ffmpeg -i music-60.mp3  -ar 48000 public/audio/music-60.wav   # the 60 s cut
ffmpeg -i music-150.mp3 -ar 48000 public/audio/music.wav      # the 150 s film
pnpm render:60 && pnpm render
```

The compositions pick these files up automatically in place of the temp bed.
In practice a take also needs editing to the picture (see **Status** above):
send it to me, and I'll measure its tempo and downbeat, and either edit it on
bar lines or set `BPM` / `DOWNBEAT_OFFSET` in `src/system/timeline.ts`.

> **Faster loop:** let this environment reach `api.elevenlabs.io` (Network
> access in the environment settings) and add `ELEVENLABS_API_KEY` as an
> environment secret. I can then generate takes, check their tempo and render
> without files passing back and forth.

## 2. Voice-over (optional, 60 s cut only)

The film is type-led, and its supers carry the message with the sound off. A
voice-over helps the 60 s cut where people watch with sound on. The script
below is a sparse read-along: it echoes the supers and adds almost nothing. I
recommend **no VO on the 150 s film**, which is a music-led showreel.

| File | At | Line | On screen |
|---|---|---|---|
| `vo-01` | 0:01.75 | AI makes pages now. Good ones. | *AI makes pages now. Good ones.* |
| `vo-02` | 0:06.00 | A screenshot doesn't move. A file doesn't travel. | the three vignettes |
| `vo-03` | 0:09.75 | Your work deserves a link. | *Your work deserves a link.* |
| `vo-04` | 0:12.75 | Drop it on kept. | the file lands in the tile |
| `vo-05` | 0:17.75 | It's live in seconds. No account. | *Live in seconds. No account.* |
| `vo-06` | 0:24.00 | Every page starts as a draft. | *Every page starts as a draft.* |
| `vo-07` | 0:28.00 | Keep it, and it's yours… forever. | *Kept — forever.* |
| `vo-08` | 0:32.75 | Your agent can publish too. No key, no account. YOU keep it. | *Your agent publishes. You keep it.* |
| `vo-09` | 0:42.00 | However it's made. | *However it's made.* |
| `vo-10` | 0:54.00 | Made with AI. Kept by you. | *Made with AI. Kept by you.* |
| `vo-11` | 0:57.25 | kept dot host. | `kept.host` |

**How to generate it:** see the [voice-over section of
`elevenlabs/prompts.md`](elevenlabs/prompts.md#voice-over--60-s-cut-optional).
It's written for Eleven v4 and covers the voice, the settings, a one-take
script with an audio tag on every line, and how to redo single lines. In short:

- **Eleven v4**, with a **Voice Library** voice that already sounds like a calm
  English narrator and has a clean preview. Not Voice Design.
- Only **Stability** (~60%) and **Similarity** (~75%). v4 has no Style or Speed
  slider and no SSML.
- **Generate the whole script as one take**, so the voice stays the same from
  line to line. Each line has a voice-quality tag (`[Warm, sincere tone]`) and
  the lines are separated by `[long pause]`. Pacing comes from punctuation: one
  ellipsis for a held beat, one capitalised word for stress, the URL written out.

The lines and tags live in `src/copy.ts` (`VO_LINES`). If you change one,
update `elevenlabs/prompts.md` and this table too; `pnpm check` fails until all
three match.

**Drop in:**

```bash
pnpm vo take.wav      # split the take → public/audio/vo/vo-01.wav … vo-11.wav
pnpm vo vo-04.mp3     # replace one line (the file name carries its id)
pnpm render:60
```

`pnpm vo` cuts the take at its ten clearest pauses and trims each line to 30 ms
before the voice starts. It stops if the pauses don't clearly fall between
lines. It then measures every line and fails if one would run into the next;
v4 has no speed setting, so this is the timing check. It also levels the
lines to −16 LUFS with peaks under −2 dBFS, using one gain for the whole take,
so the lines keep their level relative to each other. The cut ducks the music
to 40% (−8 dB) under each line, using the measured lengths. VO files stay out
of git, like the music.

The supplied take split cleanly: the pauses between lines were 0.9–1.6 s and
the pauses inside lines at most 0.54 s. No tag was read aloud, and every line
fits; the tightest is vo-02, at 3.64 s of its 3.75 s.

## 3. Royalty-free library tracks (fallback)

The environment's network policy blocks Pixabay, Mixkit, Free Music Archive,
Incompetech and Uppbeat, so I couldn't download or analyse these. I haven't
heard them either. They are Pixabay's editor's picks for "tech product launch"
that fit the brief's minimal, modern, warm tone:

| Track | Length | Notes |
|---|---|---|
| [This Minimal Technology — Pure](https://pixabay.com/music/corporate-this-minimal-technology-pure-12327/) · Coma-Media | 1:59 | minimal tech, clean |
| [Floating Abstract — Reinvention](https://pixabay.com/music/beats-floating-abstract-reinvention-142819/) · ComaStudio | 1:37 | clean beats |
| [The Last Point](https://pixabay.com/music/future-bass-the-last-point-beat-electronic-digital-394291/) · raspberrymusic | 2:04 | future bass, more energy |
| [Future Design](https://pixabay.com/music/future-bass-future-design-344320/) · penguinmusic | 1:14 | could cover the 60 s cut |
| [Modern Chillout (Future Calm)](https://pixabay.com/music/upbeat-penguinmusic-modern-chillout-future-calm-12641/) · penguinmusic | 1:06 | calmer; could cover the 60 s cut |

The Pixabay Content License allows commercial use without attribution, but not
redistributing the track on its own. Some Pixabay tracks are registered with
YouTube Content ID, so check before posting. A library track will need editing
to the picture (cuts on bar lines, a tempo of about 120), and its drop won't
fall at 0:12 / 0:22 without that edit. Send me the file and I'll do the edit.
