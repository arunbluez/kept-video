# ElevenLabs prompts — paste-ready

Plain-text versions for the ElevenLabs web app. The JSON files next to this
(`music-60.json`, `music-150.json`) say the same thing as composition plans,
for the API. Generate WAV, two or three takes each, and pick by ear.

## Music — 60 s cut

Set the length to **60 seconds**.

```
Instrumental, 60 seconds, 120 BPM, 4/4, A minor. Premium, minimal modern electronic for a calm, confident tech product film: warm analog synths, a bright plucked synth arpeggio, round sub bass, clean punchy drums, soft sidechained pads, an uncluttered mix that leaves room for UI sound effects.
Structure:
0:00–0:06 sparse plucked arpeggio with a soft kick on every quarter note, curious and light.
0:06–0:12 filtered drums and a rising riser, a snare roll into the downbeat at 0:12.
0:12–0:30 the full groove lands on the downbeat at 0:12: punchy kick, claps on 2 and 4, eighth-note sub bass, bright plucked lead, optimistic.
0:30–0:48 the same groove with variation: busier hi-hats, a playful synth counter-melody, steady energy.
0:48–0:54 the biggest moment, landing on the downbeat at 0:48: open hi-hats, an extra arpeggio layer, an uplifting chord change.
0:54–1:00 drums drop out; warm pad and the plucked motif one last time; a clean button ending just before 1:00, no long tail.
No vocals, no choir, no orchestra, no corporate ukulele or whistling, no EDM drop or dubstep, no distorted guitar, no tempo changes.
```

## Music — 150 s film

Set the length to **2 minutes 30 seconds**.

```
Instrumental, 2 minutes 30 seconds, 120 BPM, 4/4, A minor. Premium, minimal modern electronic for a calm, confident tech product film: warm analog synths, a bright plucked synth arpeggio, round sub bass, clean punchy drums, soft sidechained pads, an uncluttered mix that leaves room for UI sound effects.
Structure:
0:00–0:12 intro: sparse plucked arpeggio and airy pad, light hi-hats from 0:04, curious and unhurried.
0:12–0:22 build: soft four-on-the-floor kick, filter slowly opening, a rising riser, a snare roll into the downbeat at 0:22.
0:22–0:44 drop: the full groove lands on the downbeat at 0:22: punchy kick, claps on 2 and 4, eighth-note sub bass, bright plucked lead, optimistic.
0:44–1:04 groove: the same groove, a little drier with more space, a small melodic variation.
1:04–1:26 groove B: a playful synth counter-melody, busier hi-hats, steady energy.
1:26–1:48 peak: lands on the downbeat at 1:26: open hi-hats, an extra arpeggio layer, wider stereo, uplifting.
1:48–2:08 breakdown: drums out, dark warm pads, a filtered sparse pluck, reflective and spacious.
2:08–2:12 rebuild: a riser, the kick back on quarter notes, a snare roll into the downbeat at 2:12.
2:12–2:22 final lift: the full groove and the arpeggio layer return on the downbeat at 2:12, an uplifting chord change, the brightest moment.
2:22–2:30 resolve: drums drop out, warm pad and the plucked motif one last time, a gentle ending by 2:30.
No vocals, no choir, no orchestra, no corporate ukulele or whistling, no EDM drop or dubstep, no distorted guitar, no tempo changes.
```

## Voice-over — 60 s cut (optional)

Written for **Eleven v4** (`eleven_v4`), following ElevenLabs' [Eleven v4
notes](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4)
and [Prompting Eleven v4](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices#prompting-eleven-v4).
Use Eleven v4, not v4 Turbo, which is built for real-time agents.

### 1. Pick the voice

Pick a voice from the **Voice Library**. ElevenLabs says Voice Design voices may
sound less good on v4. Search for this:

```
A calm, warm, confident narrator for a minimal tech product film. Mid-low register, unhurried but crisp, a slight smile in the voice. Neutral international English. Conversational and understated, never salesy, no announcer voice.
```

How to choose:

- **Its preview should already sound like this read.** v4 reproduces delivery
  the voice was trained on most easily, so a calm English narrator is the right
  starting point. Don't count on the tags to turn an energetic voice calm.
- **Its preview should be clean.** v4 copies the source recording closely,
  including room sound, harsh "s" sounds and popped "p"s. Skip any voice whose
  preview has them.
- **It should be an English voice.** Its accent carries over only when it
  speaks the language it was recorded in.
- To use a particular person's voice (yours, say), an Instant Voice Clone from
  one to two minutes of clean audio in a single speaking style works well on v4.

### 2. Settings

v4 has only two settings. Starting points:

| Setting | Value | Why |
|---|---|---|
| Stability | ~60% | Higher keeps the read the same from line to line, which this script needs |
| Similarity | ~75% | Close to the voice; higher can sound less natural |

The **Style** and **Speed** sliders and **SSML** (including `<break>` tags) are
not available in v4. Pacing comes from the punctuation and the tags below.
Since there's no speed control, `pnpm vo` measures every line and flags any
that would run into the next.

### 3. Generate the whole script as one take

Paste the block below as is and generate. One take keeps the voice, level and
pace consistent from line to line, which short lines generated one at a time
often don't. Each line starts with an audio tag that describes the voice
quality, so v4 won't read it as a sound cue. Each `[long pause]` marks a break
between lines; the pauses inside a line come from the punctuation. Make two or
three takes and pick the best one. Download as **WAV** if your plan offers it,
otherwise the highest-quality MP3.

```
[Calm, warm narrator voice, unhurried] AI makes pages now. Good ones.

[long pause]

[Matter-of-fact tone, even pace] A screenshot doesn't move. A file doesn't travel.

[long pause]

[Warm, sincere tone] Your work deserves a link.

[long pause]

[Light, inviting tone] Drop it on kept.

[long pause]

[Easy, confident tone] It's live in seconds. No account.

[long pause]

[Calm, plain tone] Every page starts as a draft.

[long pause]

[Warm, reassuring tone] Keep it, and it's yours… forever.

[long pause]

[Relaxed, matter-of-fact tone] Your agent can publish too. No key, no account. YOU keep it.

[long pause]

[Quiet, thoughtful tone] However it's made.

[long pause]

[Warm, confident tone] Made with AI. Kept by you.

[long pause]

[Soft, warm voice, closing line] kept dot host.
```

What's in the text, per the v4 guide:

- **Ellipsis** in *yours… forever* gives a held beat before the word that matters.
- **Capitals** on *YOU* stress the one contrast in the script: the agent
  publishes, you keep it. That's the only capitalised word, so it stays emphasis
  rather than shouting.
- **The URL is written out** as *kept dot host*, so it isn't read as a URL.
  *kept* is lowercase and said as the plain word.
- **The tags stay in one register**: calm, warm, plain. Tags far from the voice's
  character, such as playful or excited, tend not to land.

If *AI* comes out as "eye", write it as *A.I.* for that take.

### 4. Redo a single line

Redo just the line that's off: paste its single line from the table, with the
tag, and save the file under that line's id (for example `vo-04.mp3`).

| File | Plays at | Paste |
|---|---|---|
| `vo-01` | 0:01.75 | `[Calm, warm narrator voice, unhurried] AI makes pages now. Good ones.` |
| `vo-02` | 0:06.00 | `[Matter-of-fact tone, even pace] A screenshot doesn't move. A file doesn't travel.` |
| `vo-03` | 0:09.75 | `[Warm, sincere tone] Your work deserves a link.` |
| `vo-04` | 0:12.75 | `[Light, inviting tone] Drop it on kept.` |
| `vo-05` | 0:17.75 | `[Easy, confident tone] It's live in seconds. No account.` |
| `vo-06` | 0:24.00 | `[Calm, plain tone] Every page starts as a draft.` |
| `vo-07` | 0:28.00 | `[Warm, reassuring tone] Keep it, and it's yours… forever.` |
| `vo-08` | 0:32.75 | `[Relaxed, matter-of-fact tone] Your agent can publish too. No key, no account. YOU keep it.` |
| `vo-09` | 0:42.00 | `[Quiet, thoughtful tone] However it's made.` |
| `vo-10` | 0:54.00 | `[Warm, confident tone] Made with AI. Kept by you.` |
| `vo-11` | 0:57.25 | `[Soft, warm voice, closing line] kept dot host.` |

The tightest lines are **vo-02** (3.75 s before vo-03 starts), **vo-10**
(3.25 s) and **vo-11** (2.75 s before the cut ends). If one of them runs long,
redo it, or tell me and I'll move the line.

### 5. Hand it over

Send me the take (and any redone lines), or run it yourself:

```bash
pnpm vo take.wav            # splits the take into public/audio/vo/vo-01.wav … vo-11.wav
pnpm vo vo-04.mp3           # replaces one line
pnpm render:60
```

`pnpm vo` cuts each line at the pauses, trims it to 30 ms before the voice
starts, measures it and checks it fits. If the pauses don't clearly fall
between lines, it stops and says so instead of guessing.
