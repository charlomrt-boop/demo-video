# Phase 3 — Compose (Parallel Agents)

## Goal

Implement the approved storyboard. Dispatch independent agents in parallel — never write all scenes sequentially yourself.

## Required Skill

**REQUIRED SUB-SKILL:** `superpowers:dispatching-parallel-agents`

## What to Dispatch (in a single message)

For a 6-scene storyboard, dispatch N+2 agents in parallel:

1. **One agent per non-trivial scene** (skip intro/outro if they're standard)
2. **One music-synthesis agent** to tune `synth_lofi.py` per the storyboard
3. **One layout-QA agent** to audit all stills after scenes are written

## Agent Prompts: What Each Needs

### Scene agent template

```
You're implementing scene "<id>" of the LiCleads demo. Context:

- Project root: <path>
- Storyboard: <path>/storyboard.yaml (read the `scenes[id=<id>]` entry)
- Anchors file: src/scenes/<id>.anchors.ts — already stubbed, REPLACE with real coords
- Scene file: src/scenes/<id>.tsx — already stubbed, REPLACE with full implementation
- Duration: <N> frames starting at frame 0 of this scene
- Design tokens: import from src/theme.ts (do not hardcode colours)

Constraints:
- MUST read ~/.claude/skills/demo-video/references/cursor-anchors.md and follow it
- MUST read ~/.claude/skills/demo-video/references/motion-design.md and follow it
- Cursor coordinates MUST come from the anchors file, not raw numbers
- Every cursor click must pause 20+ frames on target before clicking
- NO beat-synced scale() on any UI element
- Use absolute positioning for every targetable element

Verify:
- `npx tsc --noEmit` passes
- Render one still per click frame via `npx remotion still DemoComposition out/<id>-click-<target>.png --frame=<abs frame>`
- Open the PNGs and confirm: cursor tip is inside the target element's bounding box; no text overlap

Report back: paths to stills, any coord adjustments you made, any layout decisions worth noting.
```

### Music agent template

```
Tune procedural lofi synth for the demo.

- Script: <path>/scripts/synth_lofi.py
- Storyboard: <path>/storyboard.yaml — read music.style, tempo_bpm, dynamics
- Reference: ~/.claude/skills/demo-video/references/music-theory-lofi.md

MUST do:
- Follow the music theory rules exactly (major key, I-iii-IV-V, pentatonic melody with rest space)
- Write the mandatory header docstring citing key/BPM/progression
- Align dynamics per scene (intro drumless, payoff peak melody, outro recede)
- Use only numpy + scipy (already installed on Python 3.14)

Verify:
- Script runs without error
- Generated WAV is stereo, 44.1 kHz, matching total_seconds
- Convert to mp3: `ffmpeg -y -i public/lofi.wav -b:a 192k public/lofi.mp3`

Report back: final chord progression, tempo, what sections you tuned.
```

### QA agent template

Dispatched AFTER scene agents finish, not in parallel with them.

```
Audit stills for the demo in <path>/out/. Check each still against:
- Cursor tip inside target bounding box
- No text occluded by panels or browser
- No "TODO"/"PLACEHOLDER"/"Lorem" strings
- Numbers render as expected (no NaN, no truncation)

For each issue, specify: scene, frame, issue type, suggested fix (file + line).
Return a table. Do NOT modify any file.
```

## Parallelism Rules

- Dispatch all scene agents + music agent in the SAME message (one `<message>` with N tool calls)
- After they complete, dispatch the QA agent as a follow-up
- Do NOT call `Agent` tool twice in different messages for independent work — that's sequential, not parallel

## Anti-Patterns

- **Writing scenes yourself "because it's faster"** — at 2-3 scenes it's faster; at 5+ you'll be slower than 5 agents running concurrently
- **Giving the music agent vague direction** ("make it chill") — cite specific references and progression
- **Dispatching agents before the storyboard is approved** — they have nothing to implement to
