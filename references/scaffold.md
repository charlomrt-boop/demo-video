# Phase 2 — Scaffold

## Goal

Bootstrap the `demo-video/` project from the template. Import design tokens from the user's existing app. Create anchor stubs so phase 3 agents have clear contracts.

## Steps

```bash
# 1. Bootstrap via init script
bash ~/.claude/skills/demo-video/scripts/init.sh <project-root>/demo-video \
  --tokens <path-to-user-theme.ts> \
  --storyboard <path-to-storyboard.yaml>

# 2. Install deps
cd <project-root>/demo-video
npm install --no-audit --no-fund
```

## What the init script does

1. Copies `template/` → target directory
2. Reads `--tokens` (a TypeScript file exporting `colors`, `font`, etc.) and writes a slim `src/theme.ts` that re-exports those values. If the user's theme is too exotic, fall back to template defaults and warn.
3. Reads `--storyboard` and generates:
   - `src/Root.tsx` with the right total duration + fps + resolution
   - `src/Demo.tsx` with one `<Sequence>` per scene + correct `from`/`durationInFrames`
   - `src/scenes/<id>.tsx` — stub file per scene with a TODO comment
   - `src/scenes/<id>.anchors.ts` — stub with the anchor names listed in the storyboard
4. Creates `public/` with placeholder `lofi.mp3` (silent 40s wav)
5. Updates `scripts/synth_lofi.py` header to cite the chosen progression/key/tempo from `storyboard.yaml`

## After scaffold

You have:
- A compilable Remotion project (`npx tsc --noEmit` passes)
- Empty scenes that will render blank panels
- Correct timings
- Anchor stubs with the right names but all pointing to `{x: 260, y: 430}` (placeholder)

## Verify (MANDATORY)

```bash
cd <project-root>/demo-video
npx tsc --noEmit          # must pass
npx remotion still DemoComposition out/scaffold-check.png --frame=30
```

Open `out/scaffold-check.png` — should show the ambient background with blank panel. If yes, phase 2 is done.

**Don't skip the still.** If the scaffold's Root.tsx references scene modules that don't exist yet, `tsc --noEmit` might pass but the still renders a compilation error page. 10 seconds of still-check catches this before you dispatch 5 parallel agents against a broken scaffold.

## Theme wiring gotchas

The init script **copies** the user's theme file to `src/theme.source.ts` and re-exports from it (via `export { colors, font } from "./theme.source"`). Two things can go wrong:

1. **Exported names differ.** If the source file exports `fontFamily` instead of `font`, edit `src/theme.ts` to alias: `export { colors, fontFamily as font } from "./theme.source"`. Same for colour object naming conventions.
2. **Source imports that aren't available.** If `theme.source.ts` imports from another module in the user's project (e.g. `import { space } from "../shared"`), the copy will fail to compile. Fix: either inline the dependency, or edit `theme.source.ts` to strip non-essential imports.

Always run `npx tsc --noEmit` after theme wiring to surface these issues immediately.

## Common mistakes

- **Forgetting to import tokens** — scenes end up using template colors, not the user's brand
- **Letting scenes inherit default duration** — every scene has custom timing in the storyboard
- **Skipping the tsconfig check** — a typo in scene stubs only surfaces at full render, wasting 5 min
