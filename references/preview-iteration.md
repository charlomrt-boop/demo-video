# Phase 4 — Preview & Iterate

## Goal

Catch visual bugs before spending 5 minutes on a full render. Stills are cheap (10s each), full renders are expensive (2–5 min).

## The Still-First Rule

For each scene in the storyboard, render a still at each **cursor click frame**:

```bash
cd <project>
# Example: SceneCapture scene starts at frame 330, has a click at its local frame 50
# Absolute frame = 330 + 50 = 380
npx remotion still DemoComposition out/s2-click-smartbar.png --frame=380
npx remotion still DemoComposition out/s2-click-decideurs.png --frame=545
# etc.
```

Naming convention: `s<scene#>-<action>-<target>.png`

## Still Review Checklist (per scene)

- [ ] **Captions not occluded** — text fully visible, no overlap with panels/browser
- [ ] **Cursor on target** — tip of the arrow is INSIDE the bounding box of the clicked element
- [ ] **Click ripple visible** — within 10 frames of click, ripple is drawn
- [ ] **Layout matches intent** — no unexpected whitespace, no truncated text
- [ ] **Stats/counters readable** — numbers rendered, not `NaN` or cut off
- [ ] **No raw placeholder text** ("Lorem", "TODO", "{{PLACEHOLDER}}")

## Iteration Loop

If a still fails the checklist:

1. Identify the root cause (anchor math wrong? overlap? typo?)
2. **Dispatch a scene-specific agent** to fix (agents are cheap and scoped)
   ```
   Agent({
     description: "Fix scene 2 smart-bar overlap",
     prompt: "In src/scenes/capture.tsx, the caption at <...> overlaps the panel. Shrink the caption maxWidth to 480 or move the panel 80px right. Re-render the still at frame 380 to confirm. Report back with cursor/target delta measured from the new still."
   })
   ```
3. Re-render the SAME still, re-check
4. Only when all stills pass → go to phase 5 full render

## The Audio Preview Loop

Generate the audio once and listen to a snippet:

```bash
PY="$(which python)"
$PY scripts/synth_lofi.py
# Convert a 10-second preview instead of the full track to iterate faster
ffmpeg -y -i public/lofi.wav -t 10 -b:a 192k out/preview.mp3
start out/preview.mp3   # Windows: opens default player
```

If the audio is off (too sad, too busy, wrong tempo), consult `references/music-theory-lofi.md` and tweak the synth script BEFORE full render.

## Parallel QA Agent

For scenes beyond 3, dispatch a QA agent to audit all stills at once rather than checking each manually:

```
Agent({
  description: "Audit all scene stills",
  prompt: "Review these 8 PNG stills in <project>/out/. For each, report: (1) is the cursor inside the bounding box of its target element? (2) is the caption fully readable? (3) any raw placeholder text? Return a table with scene, frame, pass/fail, issue."
})
```

## When NOT to re-render full video

- Anchor math change → still only, NOT full render
- Typo in copy → still only
- Timing shift < 30 frames → still only for the affected scene

Do full render ONLY when all stills pass the checklist. Never skip the still check because "it's a small change".

## Full Render Command

```bash
cd <project>
npx remotion render DemoComposition out/demo.mp4
cp out/demo.mp4 <final-location>
# Optional: smaller file for sharing
ffmpeg -y -i out/demo.mp4 -vf "scale=1280:720" -b:v 2500k out/demo-720p.mp4
```

Report back: duration, file size, final location.
