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

**Voice** (pick a library voice that fits, or paste into Voice Design):

```
A calm, warm, confident narrator for a minimal tech product film. Mid-low register, unhurried but crisp, a slight smile in the voice. Neutral international English. Conversational and understated, never salesy, no announcer voice.
```

**Settings** (starting points): Stability ~55%, Similarity ~75%, Style 0–15%,
Speaker boost on. "kept" is said as the plain word.

**Lines.** Generate each line as its own file and name it as shown. Times are
where it plays in the 60 s cut; the music ducks under it automatically.

| File | At | Line |
|---|---|---|
| `vo-01` | 0:01.75 | AI makes pages now. Good ones. |
| `vo-02` | 0:06.25 | A screenshot doesn't move. A file doesn't travel. |
| `vo-03` | 0:09.75 | Your work deserves a link. |
| `vo-04` | 0:12.75 | Drop it on kept. |
| `vo-05` | 0:17.75 | It's live in seconds. No account. |
| `vo-06` | 0:24.00 | Every page starts as a draft. |
| `vo-07` | 0:28.00 | Keep it, and it's yours. Forever. |
| `vo-08` | 0:32.75 | Your agent can publish too. No key, no account. You keep it. |
| `vo-09` | 0:42.00 | However it's made. |
| `vo-10` | 0:54.00 | Made with AI. Kept by you. |
| `vo-11` | 0:57.25 | kept dot host. |

Save them as `public/audio/vo/vo-01.wav` … `vo-11.wav` (or `.mp3`), or just send
them to me.
