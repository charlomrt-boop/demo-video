# demo-video

A Claude Code skill that generates **20–60s animated product demo videos** from a terminal — UI mockups, cursor animations, procedural music, all rendered via Remotion + Python. No external editors, no screen recording, no drag-and-drop.

You describe what to show. Claude drives a 5-phase pipeline. You get an MP4.

## Why this exists

Making a product demo video normally costs you:
- An After Effects license
- A weekend of manual animation
- A paid stock music track
- Another weekend to revise

This skill replaces all of that with a reproducible terminal pipeline:

```
You (prompt)  →  Claude (5 phases)  →  demo.mp4
```

The skill has been used to ship demos for radically different products in ~10 minutes each:
- **LiCleads** — B2B LinkedIn tool, cyan/violet cockpit DA, lofi soundtrack
- **X (Twitter)** — social network, minimalist black DA, electronic minimal
- **HeyGen** — AI video SaaS, purple premium DA, aspirational build

Same harness. Different outputs.

## How it works

Claude runs through **5 mandatory phases**, in order:

```
1. STORYBOARD   →  storyboard.yaml (user approves)
2. SCAFFOLD     →  bootstrap Remotion project + import theme
3. COMPOSE      →  parallel agents: scenes + music synthesis
4. PREVIEW      →  render stills at click frames, iterate
5. DELIVER      →  full MP4 render
```

Each phase has a dedicated reference in `references/` that Claude reads before starting. The iron rules (no raw pixels in cursor coords, music theory before synth, stills before full render) are all encoded — see `SKILL.md`.

## Requirements

- Node.js 18+ (for Remotion)
- Python 3.10+ with `numpy` + `soundfile` (for procedural music synthesis)
- `ffmpeg` on PATH (for WAV → MP3 conversion)
- `bash` (Git Bash on Windows is fine)
- Claude Code with skills support

## Install

Drop this repository into your Claude skills directory:

```bash
# Clone into ~/.claude/skills/ (or wherever your skills live)
cd ~/.claude/skills
git clone https://github.com/charlomrt-boop/demo-video.git
```

Claude will pick it up automatically. Invoke with `/demo-video` or in plain prose:

> "Make me a 30s demo video for my SaaS product."

## Usage

In a Claude Code conversation:

```
/demo-video

Build me a 20s demo for <your product>.
```

Claude will:
1. Ask the 4 questions it needs (product, outcome, tone, duration)
2. Propose a `storyboard.yaml` — you approve or edit
3. Scaffold a Remotion project, importing your design tokens if you provide them
4. Dispatch parallel agents for scene TSX + Python music synthesis
5. Render stills for you to approve
6. Full render → MP4

Bring your own design tokens with `--tokens`:

```bash
bash scripts/init.sh <target-dir> --tokens <path-to-your-theme.ts>
```

Claude picks up your colors, fonts, and gradients automatically. Your demo matches your brand.

## What's inside

```
demo-video/
├── SKILL.md                  # Skill entry point Claude reads
├── references/
│   ├── storyboarding.md     # Phase 1 — YAML contract format
│   ├── scaffold.md          # Phase 2 — bootstrap rules
│   ├── compose.md           # Phase 3 — scene composition
│   ├── cursor-anchors.md    # Iron law: no raw pixels
│   ├── motion-design.md     # No-tremble rule, ease curves
│   ├── music-theory-lofi.md # Key/BPM/progression choices
│   └── preview-iteration.md # Stills before full render
├── scripts/
│   └── init.sh              # Bootstrap a new demo project
└── template/
    ├── src/                 # React/Remotion base
    ├── scripts/             # Python synth base
    └── ...
```

## Hard rules (iron law)

These rules are encoded in the skill. Claude will not skip them:

1. **Storyboard first, always.** No code before YAML approved.
2. **Anchors, never pixels.** Cursor positions use named anchors.
3. **Stills before full render.** One still per click frame.
4. **Music theory before synth.** Python script documents key + BPM + progression.
5. **No beat-synced scale.** UI scaling on beat = trembling artifact.
6. **Parallel agents for compose.** Scenes + music run concurrently.

See `SKILL.md` for the full rationalization table of common mistakes.

## Output specs

- Default: **1920×1080 @ 30 fps H.264 + AAC**
- Typical size: **1–5 MB** for 20–40s at 192kbps audio
- Rendered deterministically — same storyboard + theme → same video

## Extending

- **Other music genres**: swap `references/music-theory-lofi.md` guidance with your own (electronic, house, classical, etc.). The skill's music-gen-v2 effort explores this.
- **Different resolutions**: edit `Root.tsx` in the template — FPS/width/height constants.
- **Your own components**: drop shared components in `template/src/components/` — the skill will scaffold them into new projects.

## License

MIT — see `LICENSE`.

## Credits

Built on top of [Remotion](https://www.remotion.dev/) (video) and a fully procedural Python synth pipeline (audio). Skill format and harness rules by the [Claude Code](https://claude.com/claude-code) team's skill-building patterns.
