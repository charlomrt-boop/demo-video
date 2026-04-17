# Motion Design Rules

Reference for phase 3 (compose). Covers the visual-motion principles that keep a demo video looking professional rather than AI-slop.

## Rule 1 — NO TREMBLE (The Most Important Rule)

The instinct to beat-sync every UI element via `scale()` produces a "trembling" perception where text seems to pulse continuously. Even a 1.008x pulse is perceptible at 80 BPM and feels buggy.

**Forbidden:**
- `transform: scale(${1 + beatPulse * 0.008})` on any UI element (cards, buttons, containers)
- `transform: scale(${1 + beatPulse * anything})` on text-heavy panels
- Animating `backgroundPosition` or `width` on beat
- Any beat-synced animation that shifts element position

**Allowed for beat sync:**
- `boxShadow: 0 0 ${20 + pulse * 8}px ...` — glow intensity
- `opacity: 0.9 + pulse * 0.1` — gentle breathing on background blobs (amplitude max 0.15)
- Particle count or brightness modulation on pure-decorative layers

**Safe place to put scale pulses:** the logo in the intro/outro ONLY. Not during content scenes.

## Rule 2 — Transitions: Scale + Blur > Fade

Pure opacity fade looks cheap. Use:

```ts
enter:  scale 0.92 → 1.0  +  blur 12px → 0
exit:   scale 1.0 → 1.04  +  blur 0 → 10px
```

Duration: 14–18 frames at 30 fps. Both spring-based, not linear.

## Rule 3 — Ken Burns: Keep It Micro

Ken Burns (slow zoom) adds cinematic feel but:
- **Max zoom amplitude: 3%** over the full scene (`1.0 → 1.03`). More is dizzying.
- **Never on the stage containing the cursor** — the cursor/anchor system assumes stage scale 1.0. Put Ken Burns on the ambient background layer only.

## Rule 4 — Reveal Patterns

| Pattern | When to use |
|---------|-------------|
| Opacity fade + Y-slide 20px → 0 | Text lines, captions |
| Letter-by-letter reveal (blur 8 → 0 per char) | Hero titles (max 12 chars) |
| Spring scale 0.8 → 1 | Buttons, pills appearing |
| Count-up from 0 to N (ease-out cubic) | Stat numbers |
| Translate-X 20px → 0 + opacity | List items, cards (cascade with 10-frame stagger) |

Cascades: stagger between items = 8–14 frames. Faster than 8 feels chaotic. Slower than 14 drags.

## Rule 5 — Cursor Motion

- Ease between keyframes with `t < 0.5 ? 2*t² : 1 - Math.pow(-2t+2, 2)/2` (ease-in-out)
- Don't use linear interpolation (robotic)
- **Always pause 20–30 frames on target before clicking** (viewer needs to register the target)
- Click ripple: 18-frame expanding ring, 2.5px cyan border, scale 1 → 3, opacity 0.8 → 0
- Click press: cursor scales 1 → 0.88 for 6 frames then back

## Rule 6 — Typography

- Hero titles: 56–80px (letterSpacing: -1.5 to -2.5)
- Body caption: 18–22px (letterSpacing: 0)
- Mono/URL: `'SF Mono', 'Consolas', monospace`
- Use gradient text sparingly — one phrase per scene maximum

## Rule 7 — Ambient Background

Composed of:
- 2 radial-gradient blobs (primary + accent colors at 22–28% opacity, blur 40px)
- Grid overlay at 7–10% opacity
- 18–24 particles slow-drifting vertically (speed 0.25–0.45)
- Subtle scan-line pattern at 5–8% opacity (optional)

**Forbidden on background:**
- Fast oscillation / jitter
- Color cycling
- More than 30 particles (performance)

## Rule 8 — Panel Aesthetic

For product UI mockups:
- Border-radius 18–28px (matches modern OS panels)
- Drop shadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(primary,0.15)` for presence
- Inner padding generous (20px min)
- Content elements use absolute positioning (see cursor-anchors.md)

## Rule 9 — Pacing Per Scene Type

| Scene type | Min duration | Why |
|------------|--------------|-----|
| Intro (logo) | 2.5s | Burn logo into memory |
| Outro (CTA) | 3s | Reader needs to parse URL + CTA |
| Showing a product UI for first time | 6s | Eye needs to scan |
| "Look at this one element" | 3s | Focused attention |
| Payoff ("and then X happens") | 5s | Let the reveal breathe |

Scenes shorter than these feel rushed. Viewers won't retain.

## Rule 10 — 1920×1080 Layout Conventions

The video frame at 1920×1080 has standard zones:

```
+-----------------------+---------------+
|                       |               |
|  CAPTION zone         |  PANEL zone   |
|  80px margin          |  centered     |
|  maxWidth 540         |  ~520x860     |
|  ends at x≈620        |  starts x≈700 |
|                       |               |
+-----------------------+---------------+
```

If a scene has BOTH a caption AND a panel, enforce a 80–100px gap between them. Browser/tablet mockups that want to be wider (1200px+) must NOT share the frame with a caption — use full-width layout for those scenes.

## Quick Diagnosis

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Text trembles" | Beat-synced scale on UI | Remove scale pulse, use glow |
| "Looks AI-generated" | Default animations, fast cuts | Longer pacing, more rest |
| "Can't read the caption" | Overlapping element or too short | Widen gap OR hold scene 2s longer |
| "Boring" | No micro-animation at all | Add cursor, count-ups, cascades |
| "Too busy" | Everything animated simultaneously | Stagger: 1 thing at a time, 14-frame gaps |
| "Cursor clicks wrong spot" | Raw pixel coords | See cursor-anchors.md |
