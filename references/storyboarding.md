# Phase 1 — Storyboarding

## Goal

Produce `storyboard.yaml` — the **single source of truth** for the entire demo. Every subsequent phase derives from this file. If it's wrong, nothing downstream can save you.

## Process (45–90 seconds of conversation)

1. **Ask the user 4 questions** (and NO MORE) if not already answered:
   - What's the product, in one sentence?
   - What's the ONE thing a viewer should understand or do after watching?
   - What's the tone (chill / energetic / serious / playful)?
   - Rough duration (15s, 30s, 45s, 60s)?

2. **Propose a storyboard** (see template below). Fill in scene-by-scene with a clear narrative beat per scene. Do not invent features the product doesn't have — ask if unsure.

3. **Get user approval** on the storyboard before writing a single line of code. If they tweak it, update the YAML and ask again.

4. **Commit** `storyboard.yaml` to the project repo (even if it's a throwaway demo) so agents in phase 3 read from it as their contract.

## Storyboard YAML Format

```yaml
meta:
  title: "LiCleads — capter les commenteurs d'un post"
  total_seconds: 40
  fps: 30
  resolution: [1920, 1080]
  tone: chill-confident   # chill-confident | energetic | serious | playful
  audience: "Sales people who already use LinkedIn"
  one_outcome: "Visiter licleads.com and join the beta"

design:
  source_theme: "C:/Users/skate/Desktop/Projets/licli/extension/src/lib/theme.ts"  # imported, not copied
  primary: "#22D3EE"
  accent: "#8B5CF6"

music:
  style: lofi-jazzy-major     # see references/music-theory-lofi.md presets
  tempo_bpm: 82
  # Section dynamics aligned to scenes below:
  dynamics:
    intro:       { drums: 0, bass: 0, melody: 0 }    # 0 = silent, 1 = full
    post:        { drums: 0.3, bass: 0.6, melody: 0 }
    capture:     { drums: 1.0, bass: 1.0, melody: 0.8 }
    actions:     { drums: 1.0, bass: 1.0, melody: 1.0 }
    sequence:    { drums: 1.0, bass: 0.8, melody: 0.3 }
    outro:       { drums: 0, bass: 0.3, melody: 0 }

scenes:
  - id: intro
    duration_sec: 3
    beat: "Brand reveal — logo + tagline"
    visible:
      - "Logo LiCleads with burst rays"
      - "Tagline below"
    anchors: []                # no cursor in this scene
    cursor_timeline: []

  - id: post
    duration_sec: 8
    beat: "Here is a LinkedIn post engaging 42 commenters"
    visible:
      - "Fake LinkedIn browser, post by Sophie Martin"
      - "3 comments appear progressively"
      - "URL in browser bar"
    anchors:
      - url-bar           # target: URL bar in browser
    cursor_timeline:
      - { at_sec: 5, target: url-bar, action: click }   # copies the URL

  - id: capture
    duration_sec: 11
    beat: "Paste URL into LiCleads, commenters are auto-classified"
    visible:
      - "LiCleads side panel slides in"
      - "URL paste into Smart Bar"
      - "Stats counter 0→42/18/12"
      - "Commenter cards appear with signals"
      - "Décideurs filter activates"
    anchors:
      - smart-bar
      - decideurs-pill
    cursor_timeline:
      - { at_sec: 1.3, target: smart-bar, action: click }
      - { at_sec: 6.6, target: decideurs-pill, action: click }

  # ...etc

narrative_captions:
  # Optional: one caption per scene, shown on the left side.
  post:
    eyebrow: "UN POST ENGAGÉ"
    headline: "42 décideurs\ncommentent."
    body: "Dans 10 min, ils seront dans ta liste."
  capture:
    eyebrow: "CAPTATION"
    headline: "Tu colles l'URL.\nLiCleads trie."
    body: "Rôle, signal d'achat, décideurs pré-sélectionnés."
  # ...
```

## Quality Checks Before Approving

- [ ] **Every scene has ONE narrative beat** (not 3). If a scene tries to show 3 things, split it or drop 2.
- [ ] **Scene durations add up** to `meta.total_seconds`.
- [ ] **Every `cursor_timeline.target`** appears in its scene's `anchors` list.
- [ ] **Click targets are VISIBLE before the click, not materialized after.** If the cursor clicks an element that hasn't rendered yet (or appears at the same moment as the click), the viewer sees the cursor click nothing. Counterexample from the baseline session: the cursor clicked "Décideurs" filter at frame 200 but the 4 commenter cards it supposedly filtered only rendered from frame 230. The click reads as clicking into void. FIX RULE: for any `cursor_timeline` entry with `action: click`, ensure the click target AND the visible consequence (cards, panel, highlight) both exist at the click frame, or model the click as revealing them (not filtering pre-existing content).
- [ ] **Music dynamics follow the story**, not the other way around. The payoff scene should be the musical peak.
- [ ] **No feature is invented** — every visible element exists in the target product.
- [ ] **Intro ≤ 4s, Outro ≤ 4s.** They're necessary evils. Keep them short.

## When the User Says "Just Build It"

Do not comply. Respond with something like:

> "Je te propose ce storyboard en 60 secondes. Ça nous évite 3 rounds de correction ensuite. Valide ou modifie — ensuite je code."

Then paste a proposed storyboard and wait for approval.

## Anti-Patterns

- **Scene-specific details in the YAML** (like exact fonts, exact pixel positions) → belongs to phase 2/3, not storyboard
- **More than 6 scenes for a 40s demo** → each scene needs ~4-7s to breathe. 8 scenes × 5s = no breathing room
- **Cursor actions every scene** → if every scene has cursor clicks, the viewer can't take a breath. 50% of scenes with cursor is plenty
- **Captions longer than 3 lines** → they can't be read in 4 seconds at 20px font

## Output

When the user approves, save to `<project-root>/storyboard.yaml` and proceed to phase 2.
