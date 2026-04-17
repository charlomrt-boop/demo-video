#!/usr/bin/env bash
# Bootstrap a new demo-video project from the template.
#
# Usage:
#   bash init.sh <target-dir> [--tokens <path-to-theme.ts>] [--storyboard <path>]
#
# Copies the template, re-exports user theme if provided, and places a silent
# placeholder lofi.mp3 so Remotion can run before the synth is tuned.
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SKILL_DIR="$( dirname "$SCRIPT_DIR" )"
TEMPLATE_DIR="$SKILL_DIR/template"

TARGET=""
TOKENS=""
STORYBOARD=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tokens)     TOKENS="$2"; shift 2;;
    --storyboard) STORYBOARD="$2"; shift 2;;
    -h|--help)
      echo "Usage: init.sh <target-dir> [--tokens <theme.ts>] [--storyboard <storyboard.yaml>]"
      exit 0;;
    *)
      if [[ -z "$TARGET" ]]; then
        TARGET="$1"; shift
      else
        echo "Unknown arg: $1" >&2; exit 1
      fi;;
  esac
done

if [[ -z "$TARGET" ]]; then
  echo "Error: target directory required" >&2
  echo "Usage: init.sh <target-dir> [--tokens <theme.ts>] [--storyboard <storyboard.yaml>]" >&2
  exit 1
fi

if [[ -e "$TARGET" ]] && [[ -n "$(ls -A "$TARGET" 2>/dev/null || true)" ]]; then
  echo "Error: target directory $TARGET is not empty" >&2
  exit 1
fi

mkdir -p "$TARGET"
echo "[demo-video] copying template -> $TARGET"
cp -r "$TEMPLATE_DIR/"* "$TARGET/"

# Create public/ with a silent 1-second placeholder wav so Remotion can start
mkdir -p "$TARGET/public"
if command -v ffmpeg >/dev/null 2>&1; then
  echo "[demo-video] creating placeholder lofi.mp3 (silence, 1s)"
  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i "anullsrc=r=44100:cl=stereo" -t 1 \
    -b:a 64k "$TARGET/public/lofi.mp3" || \
    echo "[demo-video] warning: could not create placeholder audio (ffmpeg missing?)"
fi

# Theme wiring: if --tokens given, COPY the tokens file into the project
# (re-exporting via absolute path is fragile across OSes — copy is safe).
# The demo project then maintains its own snapshot; updates are intentional.
if [[ -n "$TOKENS" ]]; then
  if [[ ! -f "$TOKENS" ]]; then
    echo "[demo-video] warning: --tokens path not found: $TOKENS (using template defaults)"
  else
    SOURCE_BASENAME="$(basename "$TOKENS")"
    echo "[demo-video] copying tokens -> src/theme.source.ts (from $TOKENS)"
    cp "$TOKENS" "$TARGET/src/theme.source.ts"
    cat > "$TARGET/src/theme.ts" <<EOF
/**
 * Theme snapshot copied from:
 *   $TOKENS
 *
 * Edit ./theme.source.ts to tweak tokens locally; the demo video is
 * decoupled from the source project so future theme changes don't break it.
 *
 * If the source file exports names other than \`colors\` and \`font\`, adjust
 * the re-export below (e.g. \`export { colors, fontFamily as font } from "./theme.source"\`).
 */
export { colors, font } from "./theme.source";
EOF
    echo "[demo-video] note: if ./theme.source.ts exports \`fontFamily\` instead of \`font\`,"
    echo "             edit ./src/theme.ts to alias the export."
  fi
fi

# Storyboard: if provided, copy it into the project root
if [[ -n "$STORYBOARD" ]]; then
  if [[ -f "$STORYBOARD" ]]; then
    echo "[demo-video] copying storyboard -> $TARGET/storyboard.yaml"
    cp "$STORYBOARD" "$TARGET/storyboard.yaml"
  else
    echo "[demo-video] warning: --storyboard path not found: $STORYBOARD"
  fi
fi

echo ""
echo "[demo-video] done. next steps:"
echo "  cd $TARGET"
echo "  npm install --no-audit --no-fund"
echo "  npx tsc --noEmit   # verify"
echo ""
echo "Then follow phases 3-5 from the demo-video skill."
