# Music Theory for Demo Video Lofi

## Why This Reference Exists

Procedural synthesis with random chord choices produces sad, dragging tracks. A good lofi demo background requires deliberate music theory choices. This file documents what works for product demos — the "chill + hopeful + forward-motion" tone most demos need.

## Canonical Lofi References Studied

- **Jinsang** — "Affection", "Solitude" → F major, 80 BPM, sparse melody, felt piano + walking bass
- **Nujabes** — "Aruarian Dance", "Luv(sic)" → modal interchange, mediant iii7 as colour, never as tonic
- **Purrple Cat** — "Mind Piper" → Bb/F area, maj7/maj9 voicings
- **Idealism** — "Snowman" → major with occasional plagal mvmt
- **Lofi Girl stream** — 70% of tracks sit in F, Bb, Eb, C major with maj7 extensions

## Rule 1 — Key Selection

**Use a major key. Not minor.** A minor tonic cues sadness universally.

| Good keys | Why |
|-----------|-----|
| F major  | Warm, intimate, canonical lofi. Middle C sits as the 5th — comfortable. |
| Bb major | Slightly darker but still hopeful. Nujabes uses Bb often. |
| Eb major | Jazzy, cinematic. Good for "premium" product tones. |
| C major  | Bright but can sound generic. Safe if you add maj7 colour. |

Avoid: A minor, D minor, F# minor, any Phrygian/Aeolian mode. These default to sad.

## Rule 2 — Progression

**Use I → iii → IV → V (in some order).** All majors + one light mediant minor for colour.

Proven lofi progressions (all in F):

```
I          iii7       IV         V
Fmaj9   →  Am7     →  Bbmaj7  →  C13        [warm, canonical]
Fmaj7   →  Em7     →  Dm7     →  Gm7        [avoid — too many minors]
Fmaj9   →  Dm9     →  Gm9     →  C13        [ii-V but two minors]
Fmaj9   →  Am7     →  Dm9     →  C13        [mixed, fine but less bright]
```

**The "Am7 trick"** (Nujabes): iii7 is a MINOR chord but because it sits between Imaj and IVmaj, the ear hears it as a colour, not as a tonic minor. This lets you use one minor safely in an otherwise-major progression.

**Never do:**
- Start or end a cycle on a minor chord
- Minor tonic with dominant (e.g. Am → E7 → Am → E7) — this is "sad jazz"
- More than one minor chord per 4-chord cycle

## Rule 3 — Extensions

Always add extensions (7, 9, 11, 13). Plain major triads sound childlike/pop. Plain minor triads sound sad.

| Chord | Voicing (notes) | Feel |
|-------|-----------------|------|
| Fmaj9 | F A C E G | Warm, open, "hopeful" |
| Am7   | A C E G   | Mellow, pensive (used as colour) |
| Bbmaj7| Bb D F A  | The "Lofi Girl chord" — nostalgic but bright |
| C13   | C E G Bb D A | Dominant with 13 on top → bright resolution |

The 13 on top of a dominant (V13) is specifically anti-sad — it's a pop-jazz voicing that resolves with movement but never blues-bluesy.

## Rule 4 — Tempo

**80–88 BPM.** Below 76 it drags. Above 90 it stops being lofi.

| BPM | Feel |
|-----|------|
| 70–76 | Drags, melancholic (avoid for demos) |
| 78–82 | Classic chillhop (Jinsang, Purrple Cat) |
| 83–88 | Upbeat lofi (Idealism, Tomppabeats) |
| 90+   | Getting into boom-bap territory, less "chill" |

Sweet spot for a product demo: **82 BPM**. Add slight hi-hat swing (~6–12%) for groove, keep kick/snare on grid.

## Rule 5 — Melody Rules

The melody (sax, Rhodes, or flute synth) is where demos go wrong most often. A sax that holds long notes on the 7th or 9th sounds melancholic even in major.

**Do:**
- Start phrases with a **pickup** (rest → note), not downbeat hits
- Leave **rest space** between phrases (2+ beats of silence). Call-and-response.
- End phrases on the **3rd, 5th, or 6th** of the current chord. These are "warm chord tones".
- Use pentatonic-major cells (notes 1, 2, 3, 5, 6 of the major scale).
- Occasional chromatic passing note → resolves immediately (not held).

**Don't:**
- Hold a 7th or 9th as the last note of a phrase. That's automatic longing.
- Play all eight beats of the bar. Quarter = good. Eighths throughout = too busy for chill.
- Descend all the way to the tonic on the final note every time. That's "the movie is ending".
- Minor-key pentatonic (notes 1, b3, 4, 5, b7) even if you're in major. Save it for bluesy contexts only.

## Rule 6 — Section Dynamics

Map musical intensity to the narrative. The melody entering = the action starting. The melody receding = the payoff/resolution.

| Video section | Drums | Bass | Melody |
|---------------|-------|------|--------|
| Intro (0–3s) | 0 | 0 | 0 — silence creates space for logo |
| Setup (3–11s) | 0.3 (hihat + rim) | 0.6 | 0 — building anticipation |
| Feature reveal (11–22s) | 1.0 (kit in) | 1.0 | 0.7 — melody phrase 1 |
| Payoff (22–32s) | 1.0 | 1.0 | 1.0 — melody peak |
| Resolution (32–37s) | 1.0 | 0.8 | 0.3 — melody exits |
| Outro (37–40s) | 0 | 0.3 | 0 — piano only |

## Rule 7 — Mixing

- **Lowpass master at 8.5–9.5 kHz** — the "cassette tape" sound. More than 10 kHz = too hi-fi.
- **Soft saturation (tanh)** at threshold 0.88–0.92 — warmth without harshness.
- **Sidechain duck** bass/piano 20–30% on kick hits. Creates groove.
- **Vinyl crackle** at −34 to −28 dB — audible but not distracting. Pink noise + random pops.
- **Haas stereo** 10–14 ms delay on the widener. Not more — smears the groove.
- **Peak-limit to −2 to −3 dBFS**, NOT 0 dBFS. Headroom for transients.

## The Mandatory Header Comment

Every `synth_lofi.py` MUST start with a docstring documenting:

```python
"""
Procedural lofi for <project> demo.

Key        : F major (I-iii-IV-V with Am7 as mediant colour only)
Tempo      : 82 BPM
Progression: Fmaj9 - Am7 - Bbmaj7 - C13, 2 bars/chord, 8-bar cycle = 23.4s
Melody     : Pentatonic major in F, phrases end on 3/5/6, ample rest
Reference  : Jinsang "Affection" / Nujabes "Aruarian Dance"
Dynamics   : Intro drumless → melody peak 22-32s → drums/bass recede outro

No minor tonic. No phrygian flavour. No held 7/9 at phrase end.
"""
```

If the script doesn't justify its choices in the header, reject it and redo.

## Quick Diagnosis: "The Music Sounds Sad"

Symptom → Likely cause:
- Slow + minor-feeling → tempo < 78 OR too many minor chords
- Sparkly but still sad → melody ending on 7ths
- Moody at the start → intro drums absent for too long (if > 5s of piano-only it broods)
- Epic-cinematic-sad → too many suspended or maj7#11 chords, pull back to plain maj7/maj9
- No forward motion → no V chord, stuck on I-vi-IV loops

## Anti-Patterns

- Generating a "random" chord each bar with numpy → you'll hit minor tonic and bluesy cadences
- Copying a jazz standard's changes → most standards are minor-leaning (Autumn Leaves, So What, etc)
- Cinematic synth pads → too "film score", not "coffee shop"
- Reverb-heavy everything → makes it dreamy-sad, cut the reverb on the drums
