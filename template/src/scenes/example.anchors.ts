/**
 * Example scene anchors. Each targetable element gets a named anchor with
 * { x, y, w, h } in panel-local (or stage-local) coordinates.
 *
 * The SAME anchor is used by:
 *   - the element's positioning via anchorStyle()
 *   - the cursor's targeting via { anchor: "..." }
 *
 * This guarantees element + cursor cannot drift.
 */
import { AnchorMap } from "../lib/anchors";

export const ANCHORS = {
  "smart-bar":      { x: 260, y: 107, w: 440, h: 52 },
  "primary-button": { x: 260, y: 430, w: 220, h: 46 },
} satisfies AnchorMap<"smart-bar" | "primary-button">;

export type AnchorName = keyof typeof ANCHORS;
