"""
Procedural lo-fi jazz-hop backing track for the LiCleads demo video (40s).

Vibe target : Lofi Girl radio / Jinsang "Affection" / Nujabes "Aruarian Dance" /
Purrple Cat "Mind Piper". Warm, chill, slightly hopeful. NOT sad.

Key / harmony choices (documented) :
  Key : F major (F lydian-ish flavour via maj9 voicings).
    F major is the canonical warm lofi key : low enough to feel intimate,
    high enough that the 4th string of a guitar / C5 of a piano doesn't sound
    muddy. Jinsang's "Affection" sits around F. Lofi Girl streams lean F/Bb/Eb.

  Progression (8 bars, 2 bars per chord) :
      | Fmaj9    | Am7      | B-flat maj7 | C13        |
      |  I maj9  | iii 7    | IV maj7     | V 13       |

    Why this works (vs the previous F-Gm-C-Am which had 2 minor chords as
    emotional anchors) :
      - Imaj9  = warm, open, hopeful (Fmaj7 + added 9th = G)
      - iii7   = Am7 here is a LIGHT mediant, not a tonic minor. Because it
                 follows Imaj9 and precedes IVmaj7, the ear hears it as a
                 colour passing chord, not as a "we're in A minor" statement.
                 Nujabes uses this trick in "Luv(sic)" and "Aruarian Dance".
      - IVmaj7 = The "Lofi Girl" chord. Instantly nostalgic but bright.
      - V13    = C dominant with the 13 (A) on top keeps the resolution
                 hopeful rather than blues-bluesy. Resolves strongly to I.

  No minor tonic, no minor plagal cadence, no tritone subs. Phrygian/Aeolian
  flavours are explicitly avoided.

Tempo : 82 BPM.
  Sweet spot for chillhop. Nujabes "Aruarian Dance" ~82, Jinsang ~80-85.
  Fast enough to groove forward (the old 75 dragged), slow enough to breathe.
  Hi-hats carry a light triplet swing (push-pull ~12%), kick/snare stay on
  grid so the pocket feels relaxed but never sloppy.

Melody philosophy (sax lead) :
  - Pentatonic-major-rooted phrases with occasional diatonic 4ths and 7ths
  - Lots of REST space between phrases (call & response)
  - Phrases end on the 3rd, 5th or 6th of the current chord (warm chord
    tones) — NEVER the 7th or 9th as the last held note
  - Short staccato hooks instead of long held notes to avoid melancholy

Section plan (40s at 82 BPM, 1 bar = ~2.93s, 8 bars per chord cycle = ~23.4s) :
   0.0 -  3.0 s  : intro         piano + crackle (no bass, no drums, no lead)
   3.0 - 11.0 s  : faux post     + bass, very light drums (hihat + rim)
  11.0 - 22.0 s  : captation     full drums in, melody enters (phrase 1)
  22.0 - 32.0 s  : action peak   full arrangement, melody peak (phrase 2+3)
  32.0 - 37.0 s  : sequence      melody recedes, drums drive, piano sparkles
  37.0 - 40.0 s  : outro         gentle fade, piano + crackle only

Run : python synth_lofi.py
Output : ../public/lofi.wav
"""

from __future__ import annotations

import os
import sys
import numpy as np
from scipy.io import wavfile
from scipy import signal

SR = 44100
DURATION = 40.0
N = int(SR * DURATION)

BPM = 82.0
BEAT = 60.0 / BPM                   # ~0.7317 s per beat
BAR = BEAT * 4                      # ~2.927 s per bar
CHORD_BARS = 2
CHORD_SEC = BAR * CHORD_BARS        # ~5.854 s per chord

# Section boundaries in seconds (see header)
SEC_INTRO_END = 3.0
SEC_POST_END = 11.0
SEC_CAPTATION_END = 22.0
SEC_PEAK_END = 32.0
SEC_SEQ_END = 37.0
# remainder = outro


# ---------- notes ----------
NOTE_SEMITONES = {
    "C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4,
    "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2,
}


def note_hz(semitone_from_a4: float) -> float:
    return 440.0 * (2 ** (semitone_from_a4 / 12.0))


def parse_note(name: str) -> float:
    # Accept "C4", "C#4", "Bb4"
    if name[1] == "#" or name[1] == "b":
        pitch = name[:2]
        octave = int(name[2:])
        if pitch.endswith("b"):
            # Flat -> convert to sharp equivalent
            flat_to_sharp = {"Db": "C#", "Eb": "D#", "Gb": "F#",
                             "Ab": "G#", "Bb": "A#"}
            pitch = flat_to_sharp.get(pitch, pitch)
    else:
        pitch = name[0]
        octave = int(name[1:])
    st = NOTE_SEMITONES[pitch] + (octave - 4) * 12
    return note_hz(st)


# ---------- chord progression : F major I - iii - IV - V ----------
# Voicings are spread across octaves 3-4 to sit in the felt-piano sweet spot.
CHORDS = [
    # Fmaj9  : F A C E G   (root, 3, 5, 7, 9)
    {"name": "Fmaj9",
     "bass": "F2",
     "piano": ["F3", "A3", "C4", "E4", "G4"]},

    # Am7    : A C E G     (mediant colour, not a tonic minor)
    {"name": "Am7",
     "bass": "A2",
     "piano": ["A3", "C4", "E4", "G4", "B4"]},

    # Bbmaj7 : Bb D F A    (the "Lofi Girl" IV chord)
    {"name": "Bbmaj7",
     "bass": "A#2",
     "piano": ["A#3", "D4", "F4", "A4", "C5"]},

    # C13    : C E G Bb D A  (dominant with bright 13th on top)
    {"name": "C13",
     "bass": "C3",
     "piano": ["C3", "E3", "G3", "A#3", "D4", "A4"]},
]


def chord_at_bar(bar_idx: int) -> dict:
    return CHORDS[(bar_idx // CHORD_BARS) % len(CHORDS)]


# ---------- envelopes ----------
def adsr(length: int, a: float, d: float, r: float, sus: float = 0.6) -> np.ndarray:
    env = np.zeros(length)
    na = int(a * SR)
    nd = int(d * SR)
    nr = int(r * SR)
    adr = na + nd + nr
    if adr > length:
        scale = length / max(adr, 1)
        na = int(na * scale)
        nd = int(nd * scale)
        nr = max(0, length - na - nd)
    ns = max(0, length - na - nd - nr)
    if na > 0:
        env[:na] = np.linspace(0, 1, na)
    if nd > 0:
        env[na:na + nd] = np.linspace(1, sus, nd)
    if ns > 0:
        env[na + nd:na + nd + ns] = sus
    if nr > 0:
        env[na + nd + ns:na + nd + ns + nr] = np.linspace(sus, 0, nr)
    return env


# ---------- synthesis ----------
def felt_piano(freq: float, dur: float, velocity: float = 0.7) -> np.ndarray:
    """Soft felt piano. Added slight detune for warmth."""
    n = int(dur * SR)
    x = np.arange(n) / SR
    # Slight detune on octave partial = chorus-y warmth
    detune = 1.0 + 0.0018
    wave = (
        1.00 * np.sin(2 * np.pi * freq * x)
        + 0.32 * np.sin(2 * np.pi * freq * 2 * x * detune)
        + 0.14 * np.sin(2 * np.pi * freq * 3 * x)
        + 0.055 * np.sin(2 * np.pi * freq * 5 * x)
        + 0.02 * np.sin(2 * np.pi * freq * 7 * x)
    )
    env = adsr(n, a=0.02, d=0.35, r=0.35, sus=0.38)
    # very subtle drift, not vibrato
    drift = 1.0 + 0.0012 * np.sin(2 * np.pi * 3.2 * x)
    return wave * env * velocity * drift


def sax_lead(freq: float, dur: float, velocity: float = 0.6) -> np.ndarray:
    """Warm saxy lead. Brighter than the old version, shorter tail."""
    n = int(dur * SR)
    if n <= 0:
        return np.zeros(0)
    x = np.arange(n) / SR
    wave = (
        1.00 * np.sin(2 * np.pi * freq * x)
        + 0.45 * np.sin(2 * np.pi * freq * 2 * x)
        + 0.24 * np.sin(2 * np.pi * freq * 3 * x)
        + 0.12 * np.sin(2 * np.pi * freq * 4 * x)
        + 0.05 * np.sin(2 * np.pi * freq * 5 * x)
    )
    # Quick warm attack, shorter decay => less held/sad
    env = adsr(n, a=0.05, d=0.12, r=0.18, sus=0.7)
    breath = np.random.randn(n) * 0.018 * env
    # Subtle vibrato only on sustain portion
    vib = 1.0 + 0.010 * np.sin(2 * np.pi * 5.2 * x)
    return (wave * env * vib + breath) * velocity


def kick(dur: float = 0.35, vel: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    x = np.arange(n) / SR
    pitch = 50 + (120 - 50) * np.exp(-x / 0.035)
    phase = 2 * np.pi * np.cumsum(pitch) / SR
    env = np.exp(-x / 0.11)
    return np.sin(phase) * env * 0.85 * vel


def brushed_snare(dur: float = 0.28, vel: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    noise = np.random.randn(n)
    b, a = signal.butter(4, [750 / (SR / 2), 4800 / (SR / 2)], btype="band")
    noise = signal.filtfilt(b, a, noise)
    env = adsr(n, a=0.008, d=0.05, r=0.12, sus=0.28)
    return noise * env * 0.3 * vel


def rimshot(dur: float = 0.09, vel: float = 1.0) -> np.ndarray:
    """Soft rim/cross-stick for the quiet section."""
    n = int(dur * SR)
    x = np.arange(n) / SR
    # Pitched click ~1.2kHz + short noise burst
    tone = np.sin(2 * np.pi * 1200 * x) * np.exp(-x / 0.012)
    noise = np.random.randn(n) * np.exp(-x / 0.008) * 0.5
    return (tone + noise) * 0.25 * vel


def hihat_tick(dur: float = 0.08, vel: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    noise = np.random.randn(n)
    b, a = signal.butter(4, 7500 / (SR / 2), btype="high")
    noise = signal.filtfilt(b, a, noise)
    env = np.exp(-np.arange(n) / SR / 0.022)
    return noise * env * 0.11 * vel


def bass_note(freq: float, dur: float, vel: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    x = np.arange(n) / SR
    wave = (
        1.00 * np.sin(2 * np.pi * freq * x)
        + 0.38 * np.sin(2 * np.pi * freq * 2 * x)
        + 0.10 * np.sin(2 * np.pi * freq * 3 * x)
        + 0.03 * np.sin(2 * np.pi * freq * 4 * x)
    )
    env = adsr(n, a=0.008, d=0.14, r=0.22, sus=0.6)
    return wave * env * 0.55 * vel


# ---------- utilities ----------
def place(out: np.ndarray, sample: np.ndarray, start_sec: float) -> None:
    if len(sample) == 0:
        return
    start = int(start_sec * SR)
    end = min(start + len(sample), len(out))
    if start >= len(out) or start < 0:
        return
    out[start:end] += sample[: end - start]


def section_level(t: float, attack_sec: float = 0.6) -> dict:
    """Return amplitude multipliers per stem for a given time t (seconds)."""
    if t < SEC_INTRO_END:          # 0-3 : intro
        return {"piano": 0.85, "bass": 0.0, "drums": 0.0, "melody": 0.0,
                "sparkle": 0.0}
    if t < SEC_POST_END:           # 3-11 : faux post (bass + light drums)
        # Smooth fade-in for bass and drums over the first 0.6s of this section
        x = min(1.0, (t - SEC_INTRO_END) / attack_sec)
        return {"piano": 1.0, "bass": 0.9 * x, "drums": 0.45 * x,
                "melody": 0.0, "sparkle": 0.3}
    if t < SEC_CAPTATION_END:      # 11-22 : captation, melody enters
        x = min(1.0, (t - SEC_POST_END) / attack_sec)
        return {"piano": 1.0, "bass": 1.0, "drums": 0.85 + 0.1 * x,
                "melody": 0.85 * x, "sparkle": 0.4}
    if t < SEC_PEAK_END:           # 22-32 : peak
        return {"piano": 1.0, "bass": 1.0, "drums": 1.0, "melody": 1.0,
                "sparkle": 0.7}
    if t < SEC_SEQ_END:            # 32-37 : melody recedes, drums drive
        x = min(1.0, (t - SEC_PEAK_END) / 1.0)
        return {"piano": 1.0, "bass": 0.95, "drums": 1.0,
                "melody": max(0.0, 0.7 - 0.7 * x), "sparkle": 1.0}
    # 37-40 : outro
    x = min(1.0, (t - SEC_SEQ_END) / 0.6)
    return {"piano": 0.9, "bass": max(0.0, 0.9 - 0.9 * x),
            "drums": max(0.0, 1.0 - 1.2 * x),
            "melody": 0.0, "sparkle": max(0.0, 1.0 - 1.0 * x)}


# ---------- piano ----------
def build_piano(total_dur: float) -> np.ndarray:
    out = np.zeros(int(total_dur * SR))
    n_bars = int(total_dur / BAR) + 2
    for bar_idx in range(n_bars):
        bar_start = bar_idx * BAR
        if bar_start >= total_dur:
            break
        chord = chord_at_bar(bar_idx)
        # Comp pattern : beat 1 full chord, beat 2.5 upper voices (syncopated)
        # This matches Nujabes "Aruarian Dance" piano comping.
        lvl = section_level(bar_start)["piano"]
        # Full chord on beat 1
        for n_idx, note_name in enumerate(chord["piano"]):
            freq = parse_note(note_name)
            vel = (0.68 - n_idx * 0.07) * lvl
            if vel <= 0:
                continue
            sample = felt_piano(freq, dur=1.8, velocity=vel)
            place(out, sample, bar_start + 0.0 * BEAT)
        # Upper voices (inner harmony) on the "and" of beat 2 (syncopation)
        inner = chord["piano"][2:5]
        for n_idx, note_name in enumerate(inner):
            freq = parse_note(note_name)
            vel = (0.4 - n_idx * 0.06) * lvl
            if vel <= 0:
                continue
            sample = felt_piano(freq, dur=1.2, velocity=vel)
            place(out, sample, bar_start + 2.5 * BEAT)
        # Sparkle arp in the high octave at bar end (hopeful shimmer)
        sparkle_lvl = section_level(bar_start + 3 * BEAT)["sparkle"]
        if sparkle_lvl > 0 and bar_idx % 2 == 1:
            arp = chord["piano"][1:4]
            for i, note_name in enumerate(arp):
                freq = parse_note(note_name) * 2
                sample = felt_piano(freq, dur=0.35,
                                    velocity=0.22 * sparkle_lvl)
                place(out, sample, bar_start + 3.25 * BEAT + i * 0.14)
    return out


# ---------- bass : walking / diatonic ----------
def build_bass(total_dur: float) -> np.ndarray:
    """Walking bass pattern per chord : root - 5th - root oct - approach note.
    Approach note = chromatic step below the next chord root.
    Simple, warm, diatonic in F major."""
    out = np.zeros(int(total_dur * SR))
    n_bars = int(total_dur / BAR) + 2
    for bar_idx in range(n_bars):
        bar_start = bar_idx * BAR
        if bar_start >= total_dur:
            break
        lvl = section_level(bar_start)["bass"]
        if lvl <= 0:
            continue
        chord = chord_at_bar(bar_idx)
        next_chord = chord_at_bar(bar_idx + 1)
        root = parse_note(chord["bass"])
        fifth = root * 1.4983                     # perfect 5th ratio
        octave_up = root * 2.0
        # Approach : semitone below next root (classic walking bass)
        approach = parse_note(next_chord["bass"]) * (2 ** (-1 / 12))
        # Pattern varies per bar within a 2-bar chord : bar 1 = steady,
        # bar 2 = walking approach
        within_chord_bar = (bar_idx // 1) % CHORD_BARS
        if within_chord_bar == 0:
            pattern = [root, root, fifth, octave_up]
        else:
            pattern = [root, fifth, octave_up, approach]
        for beat, freq in enumerate(pattern):
            # Slight velocity variation for human feel
            vel = (0.95 if beat == 0 else 0.78) * lvl
            place(out, bass_note(freq, dur=0.72, vel=vel),
                  bar_start + beat * BEAT)
    return out


# ---------- drums : kick/snare on grid, hihat with slight swing ----------
def build_drums(total_dur: float) -> np.ndarray:
    out = np.zeros(int(total_dur * SR))
    n_bars = int(total_dur / BAR) + 2
    # Swing amount for hi-hats : push the "and" slightly late
    swing = 0.06 * BEAT              # ~6% push for chill pocket
    for bar_idx in range(n_bars):
        bar_start = bar_idx * BAR
        if bar_start >= total_dur:
            break
        t_mid = bar_start + BAR * 0.5
        lvl = section_level(t_mid)["drums"]
        if lvl <= 0:
            continue
        # ---- Section-aware drum density ----
        if t_mid < SEC_POST_END:
            # Faux post section : just hihat 8ths + rim on 3
            for i in range(8):
                pos = i * 0.5
                push = swing if (i % 2 == 1) else 0.0
                vel = (0.55 if i % 2 == 0 else 0.35) * lvl
                place(out, hihat_tick(vel=vel),
                      bar_start + pos * BEAT + push)
            place(out, rimshot(vel=0.7 * lvl), bar_start + 2.0 * BEAT)
        else:
            # Full kit
            # Kick on 1 and "and of 2" (lofi boom-bap feel)
            place(out, kick(vel=lvl), bar_start + 0.0 * BEAT)
            place(out, kick(vel=0.72 * lvl), bar_start + 2.5 * BEAT)
            # Occasional ghost kick on "4 and"
            if lvl >= 0.9 and bar_idx % 2 == 1:
                place(out, kick(vel=0.35 * lvl), bar_start + 3.75 * BEAT)
            # Brushed snare on 2 and 4 (on grid, no swing)
            place(out, brushed_snare(vel=0.95 * lvl), bar_start + 1.0 * BEAT)
            place(out, brushed_snare(vel=0.95 * lvl), bar_start + 3.0 * BEAT)
            # Hi-hat 8ths with swing on off-beats
            for i in range(8):
                pos = i * 0.5
                push = swing if (i % 2 == 1) else 0.0
                # Accent pattern : stronger on downbeats, lighter on "e"
                vel = (0.95 if i % 2 == 0 else 0.55) * lvl
                place(out, hihat_tick(vel=vel),
                      bar_start + pos * BEAT + push)
    return out


# ---------- melody : sax lead with rests and call-and-response ----------
def build_melody(total_dur: float) -> np.ndarray:
    """
    Four phrases (one per 2-bar chord section) built on F major pentatonic
    (F G A C D) with added diatonic colour tones (E, Bb) from the underlying
    chord. Each phrase :
      - starts after a small pickup rest
      - has breath space (None = rest) in the middle
      - ends on a CHORD TONE that is the 3rd, 5th, or 6th of the chord
        (bright / warm), never the 7th or 9th as a last held note
      - stays in octave 4-5 for airy Jinsang feel
    """
    out = np.zeros(int(total_dur * SR))
    n_bars = int(total_dur / BAR) + 2

    # Phrases are lists of (note_or_None, beats, velocity).
    # None = rest. Total of each phrase stays under 8 beats (2 bars).
    phrases = [
        # Phrase 1 : over Fmaj9
        # Hook : rest-C-D-F... rest... A-G-(land on A = 3rd of F, bright)
        # A is the major third of F = warm resolution.
        [(None, 1.0, 0.0),
         ("C5", 0.5, 0.55), ("D5", 0.5, 0.6), ("F5", 1.0, 0.7),
         (None, 0.75, 0.0),
         ("A4", 0.75, 0.55), ("G4", 0.5, 0.5), ("A4", 2.0, 0.55),
         (None, 1.0, 0.0)],

        # Phrase 2 : over Am7
        # Answering call : echoes phrase 1 a step lower, lands on E = 5th of A
        # E is a warm perfect 5th of A : confident, not mournful.
        [(None, 0.5, 0.0),
         ("G4", 0.5, 0.5), ("A4", 0.5, 0.55), ("C5", 1.0, 0.65),
         ("E5", 1.0, 0.7),
         (None, 0.75, 0.0),
         ("D5", 0.5, 0.55), ("C5", 0.5, 0.55), ("E5", 2.0, 0.62),
         (None, 0.75, 0.0)],

        # Phrase 3 : over Bbmaj7 (the "Lofi Girl" IV)
        # Open upward motion, rest, then lands on D = 3rd of Bb (bright)
        [(None, 0.75, 0.0),
         ("F5", 0.5, 0.6), ("G5", 0.5, 0.6), ("A5", 1.0, 0.7),
         (None, 1.0, 0.0),
         ("G5", 0.5, 0.55), ("F5", 0.5, 0.55), ("D5", 2.25, 0.62)],

        # Phrase 4 : over C13 (V)
        # Short pentatonic hook with chromatic passing note (G# -> A)
        # then rest — the V chord WANTS space before resolving.
        # Lands on G = 5th of C (strong, hopeful).
        [(None, 0.5, 0.0),
         ("E5", 0.5, 0.6), ("G5", 0.75, 0.65), ("A5", 0.75, 0.6),
         ("G#5", 0.25, 0.4), ("A5", 0.5, 0.55),
         (None, 1.25, 0.0),
         ("G5", 1.5, 0.55),
         (None, 2.0, 0.0)],
    ]

    # Over the 40s window, melody is active only between CAPTATION_END
    # entrance cue (11s) and SEC_PEAK_END (32s).
    bar_idx = 0
    while bar_idx < n_bars:
        bar_start = bar_idx * BAR
        if bar_start >= total_dur:
            break
        t_center = bar_start + BAR
        mel_lvl = section_level(t_center)["melody"]
        # Only render if we're in a melody-active region
        if mel_lvl > 0.01:
            chord_idx = (bar_idx // CHORD_BARS) % len(phrases)
            phrase = phrases[chord_idx]
            t_cursor = bar_start
            for note_name, dur_beats, vel in phrase:
                dur_sec = dur_beats * BEAT
                if note_name is None:
                    t_cursor += dur_sec
                    continue
                if t_cursor >= total_dur:
                    break
                freq = parse_note(note_name)
                # Articulation : 88% of slot for legato with a small gap
                sample = sax_lead(freq, dur=dur_sec * 0.88,
                                  velocity=vel * mel_lvl)
                place(out, sample, t_cursor)
                t_cursor += dur_sec
        bar_idx += CHORD_BARS
    return out


# ---------- vinyl crackle ----------
def vinyl_crackle(total_dur: float) -> np.ndarray:
    n = int(total_dur * SR)
    rng = np.random.default_rng(7)
    white = rng.standard_normal(n)
    b, a = signal.butter(2, 5200 / (SR / 2), btype="low")
    hiss = signal.filtfilt(b, a, white) * 0.014
    pops = np.zeros(n)
    n_pops = int(total_dur * 2.8)
    for _ in range(n_pops):
        pos = int(rng.uniform(0, n - 200))
        amp = rng.uniform(0.03, 0.11)
        length = int(rng.uniform(20, 180))
        burst = rng.standard_normal(length) * amp * np.exp(-np.arange(length) / 40)
        pops[pos:pos + length] += burst
    return hiss + pops


# ---------- mix helpers ----------
def sidechain_duck(bus: np.ndarray, trigger: np.ndarray, amount: float = 0.3,
                   release_ms: float = 220) -> np.ndarray:
    env = np.abs(trigger)
    release = int(release_ms / 1000 * SR)
    follower = np.zeros_like(env)
    coef = np.exp(-1.0 / max(release, 1))
    acc = 0.0
    max_env = np.max(env) + 1e-9
    for i in range(len(env)):
        target = env[i] / max_env
        if target > acc:
            acc = target
        else:
            acc = target + (acc - target) * coef
        follower[i] = acc
    gain = 1.0 - follower * amount
    return bus * gain


def soft_clip(x: np.ndarray, threshold: float = 0.85) -> np.ndarray:
    return np.tanh(x / threshold) * threshold


def lowpass(x: np.ndarray, cutoff: float = 9000) -> np.ndarray:
    b, a = signal.butter(4, cutoff / (SR / 2), btype="low")
    return signal.filtfilt(b, a, x)


def highshelf_warm(x: np.ndarray) -> np.ndarray:
    """Gentle tilt : reduce highs a touch, boost low-mids for warmth."""
    # Shelving via two butter filters mixed
    b_low, a_low = signal.butter(2, 400 / (SR / 2), btype="low")
    low = signal.filtfilt(b_low, a_low, x)
    return x + low * 0.08


def stereo_widen(mono: np.ndarray, width: float = 0.15,
                 delay_ms: float = 11) -> np.ndarray:
    delay = int(delay_ms / 1000 * SR)
    left = mono.copy()
    right = np.zeros_like(mono)
    right[delay:] = mono[:-delay] * (1 + width)
    right[:delay] = mono[:delay] * (1 - width * 0.5)
    return np.stack([left, right], axis=1)


# ---------- main ----------
def main() -> None:
    np.random.seed(42)  # reproducible breath noise / brushes
    total_dur = DURATION

    print("synthesizing piano...", file=sys.stderr)
    piano = build_piano(total_dur)
    print("synthesizing bass...", file=sys.stderr)
    bass = build_bass(total_dur)
    print("synthesizing drums...", file=sys.stderr)
    drums = build_drums(total_dur)
    print("synthesizing melody...", file=sys.stderr)
    melody = build_melody(total_dur)
    print("synthesizing crackle...", file=sys.stderr)
    crackle = vinyl_crackle(total_dur)

    m = min(len(piano), len(bass), len(drums), len(melody), len(crackle))
    piano = piano[:m]
    bass = bass[:m]
    drums = drums[:m]
    melody = melody[:m]
    crackle = crackle[:m]

    print("mixing...", file=sys.stderr)
    # Sidechain bass slightly to kick
    bass_d = sidechain_duck(bass, drums, amount=0.22, release_ms=160)
    # Sidechain piano VERY subtly to drums for pocket
    piano_d = sidechain_duck(piano, drums, amount=0.08, release_ms=240)

    mix = (
        0.70 * piano_d
        + 0.72 * bass_d
        + 0.52 * drums
        + 0.60 * melody
        + 0.95 * crackle
    )

    mix = highshelf_warm(mix)
    mix = lowpass(mix, cutoff=9200)   # gentle tape-style roll-off
    mix = soft_clip(mix, threshold=0.90)

    # Master fades : short in (we start on piano anyway), longer out
    fade_in = int(0.8 * SR)
    fade_out = int(2.8 * SR)
    if len(mix) > fade_in + fade_out:
        mix[:fade_in] *= np.linspace(0, 1, fade_in)
        mix[-fade_out:] *= np.linspace(1, 0, fade_out)

    peak = np.max(np.abs(mix)) + 1e-9
    mix = mix * (0.74 / peak)

    stereo = stereo_widen(mix, width=0.18, delay_ms=12)
    out_i16 = np.int16(np.clip(stereo, -1.0, 1.0) * 32767)

    here = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.normpath(os.path.join(here, "..", "public", "lofi.wav"))
    wavfile.write(out_path, SR, out_i16)
    print(f"wrote {out_path}  ({len(out_i16) / SR:.2f}s)", file=sys.stderr)


if __name__ == "__main__":
    main()
