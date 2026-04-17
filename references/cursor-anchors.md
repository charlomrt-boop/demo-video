# Cursor Anchors — Single Source of Truth for Positioning

## The Problem

In the baseline session, cursor clicks missed their targets by 50–80 pixels. Fixes required:
- Reading component source files
- Summing padding/margin stacks manually
- Two full agent dispatches to recompute
- Still broke on any layout change

Root cause: **cursor coordinates were recomputed independently from element coordinates.** Two separate sources of truth → they drift.

## The Rule

Every clickable/targetable element is positioned via a named anchor from a shared `anchors.ts`. The cursor targets that anchor BY NAME, not by re-deriving pixels.

**Iron law:** No `{ x: NNN, y: NNN }` in a `CursorKeyframe`. Ever. If you type a number in a cursor keyframe, you're doing it wrong.

## Required Pattern

### 1. Define anchors per scene

```ts
// src/scenes/capture.anchors.ts
// Coordinates are LOCAL to the panel (0,0 = top-left of panel)
// These coords define where elements RENDER AND where the cursor TARGETS.
export const ANCHORS = {
  "smart-bar":      { x: 260, y: 107, w: 440, h: 52 },
  "decideurs-pill": { x: 137, y: 260, w: 110, h: 24 },
  "first-card":     { x: 260, y: 330, w: 470, h: 48 },
  "selection-bar":  { x: 260, y: 830, w: 470, h: 46 },
} as const;

export type AnchorName = keyof typeof ANCHORS;
```

### 2. Element positions itself using its anchor

```tsx
import { ANCHORS } from "./capture.anchors";
import { anchorStyle } from "../lib/anchors";

<div style={anchorStyle(ANCHORS["smart-bar"])}>
  <SmartBarInput />
</div>
```

Where `anchorStyle` is a tiny helper:

```ts
// src/lib/anchors.ts
export function anchorStyle(a: { x: number; y: number; w: number; h: number }) {
  return {
    position: "absolute" as const,
    left: a.x - a.w / 2,
    top:  a.y - a.h / 2,
    width:  a.w,
    height: a.h,
  };
}
```

### 3. Cursor targets anchors BY NAME

```tsx
import { ANCHORS } from "./capture.anchors";
import { Cursor } from "../components/Cursor";

<Cursor
  frame={frame}
  anchors={ANCHORS}
  keyframes={[
    { at: 0,   anchor: "smart-bar",      offset: { x: 0, y: 500 } }, // offscreen start
    { at: 40,  anchor: "smart-bar" },
    { at: 85,  anchor: "smart-bar" },
    { at: 200, anchor: "decideurs-pill", action: "click" },
    { at: 240, anchor: "decideurs-pill" },
    { at: 300, anchor: "selection-bar",  action: "click" },
  ]}
/>
```

### 4. Cursor implementation (in the template)

```tsx
type Keyframe<A extends string> = {
  at: number;                    // frame
  anchor: A;
  offset?: { x: number; y: number };
  action?: "click";
};

export function Cursor<A extends string>({
  frame,
  anchors,
  keyframes,
}: {
  frame: number;
  anchors: Record<A, { x: number; y: number }>;
  keyframes: Keyframe<A>[];
}) {
  // Resolve each keyframe to absolute (x,y) by looking up its anchor
  const resolved = keyframes.map((k) => ({
    frame: k.at,
    x: anchors[k.anchor].x + (k.offset?.x ?? 0),
    y: anchors[k.anchor].y + (k.offset?.y ?? 0),
    click: k.action === "click",
  }));
  // ... interpolate between surrounding keyframes with ease-in-out ...
}
```

## Why This Works

- The element's `left`/`top` and the cursor's target both derive from the same `ANCHORS[name]`. They cannot drift.
- Moving an element = change one number in `ANCHORS`. The cursor follows automatically.
- A grep for `ANCHORS[` or the anchor-name-strings shows every usage site.
- Forgetting to target an existing element surfaces as a TypeScript error (the name isn't in `AnchorName`).

## Mandatory: Absolute Positioning Inside the Panel

For anchors to work, the panel's content must use `position: absolute` for targetable elements. This breaks flow layout, but it's the price of reliable cursor targeting.

Acceptable:
```tsx
<PanelFrame>
  <div style={anchorStyle(ANCHORS["smart-bar"])}>  // absolute positioned
    <SmartBarInput />
  </div>
  <div style={anchorStyle(ANCHORS["stats"])}>      // absolute positioned
    <Stats />
  </div>
</PanelFrame>
```

Not acceptable (defeats the purpose):
```tsx
<PanelFrame>
  <div>
    <SmartBarInput />   {/* flex-flow, cursor can't know where this lands */}
    <Stats />
  </div>
</PanelFrame>
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `Cursor` uses raw `{ x, y, frame }` | Replace with `{ at, anchor, action? }` |
| Anchor defined but element positioned via flex | Use `anchorStyle()` on the element too |
| Anchor names as raw strings (typos) | Import `AnchorName` type, TS catches typos |
| Multiple sources of truth (one `ANCHORS` for cursor, another set of constants for layout) | Merge into one |
| Ken-Burns / scaling the container → anchors off | Keep stage at `scale(1)`; put Ken-Burns on background elements only |

## Verification

Run `npx remotion still <comp> out/debug.png --frame=N` at EACH click frame from the cursor keyframes. The cursor tip should be inside the bounding box of the targeted element. If not, fix the anchor (it's wrong for BOTH the element and the cursor in the same way).
