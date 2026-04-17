/**
 * Anchor-based positioning — single source of truth.
 * See ~/.claude/skills/demo-video/references/cursor-anchors.md
 */

export type Anchor = { x: number; y: number; w: number; h: number };

export type AnchorMap<K extends string> = Record<K, Anchor>;

/**
 * Absolute-positioning style derived from an anchor.
 * The anchor's (x,y) is the CENTER of the element. Width/height drive the box.
 */
export function anchorStyle(a: Anchor): React.CSSProperties {
  return {
    position: "absolute",
    left: a.x - a.w / 2,
    top: a.y - a.h / 2,
    width: a.w,
    height: a.h,
  };
}
