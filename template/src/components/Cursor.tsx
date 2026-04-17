import React from "react";
import { interpolate } from "remotion";
import { Anchor, AnchorMap } from "../lib/anchors";

/**
 * Cursor that targets named anchors, never raw coordinates.
 *
 * Usage:
 *   <Cursor
 *     frame={frame}
 *     anchors={ANCHORS}
 *     keyframes={[
 *       { at: 0,   anchor: "smart-bar", offset: { x: 0, y: 500 } },
 *       { at: 40,  anchor: "smart-bar" },
 *       { at: 200, anchor: "decideurs-pill", action: "click" },
 *     ]}
 *   />
 *
 * Rendered inside the same position:relative parent as the targeted elements,
 * so anchor coordinates resolve in the same local space.
 */
export type CursorKeyframe<A extends string> = {
  at: number;                        // frame
  anchor: A;
  offset?: { x: number; y: number }; // additive to the anchor center
  action?: "click";
};

export function Cursor<A extends string>({
  frame,
  anchors,
  keyframes,
  cursorColor = "#FFFFFF",
  cursorOutline = "#0A0F1A",
  rippleColor = "#22D3EE",
  size = 32,
}: {
  frame: number;
  anchors: AnchorMap<A>;
  keyframes: CursorKeyframe<A>[];
  cursorColor?: string;
  cursorOutline?: string;
  rippleColor?: string;
  size?: number;
}) {
  if (keyframes.length === 0) return null;

  // Resolve each keyframe to absolute local (x, y)
  const resolved = keyframes.map((k) => {
    const a: Anchor = anchors[k.anchor];
    return {
      frame: k.at,
      x: a.x + (k.offset?.x ?? 0),
      y: a.y + (k.offset?.y ?? 0),
      click: k.action === "click",
    };
  });

  // Find the segment we're currently in
  let from = resolved[0];
  let to = resolved[resolved.length - 1];
  for (let i = 0; i < resolved.length - 1; i++) {
    if (frame >= resolved[i].frame && frame <= resolved[i + 1].frame) {
      from = resolved[i];
      to = resolved[i + 1];
      break;
    }
    if (frame > resolved[i + 1].frame) {
      from = resolved[i + 1];
      to = resolved[i + 1];
    }
  }

  const t =
    from.frame === to.frame
      ? 1
      : interpolate(frame, [from.frame, to.frame], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const x = from.x + (to.x - from.x) * eased;
  const y = from.y + (to.y - from.y) * eased;

  // Click ripple(s)
  const clickFrames = resolved.filter((r) => r.click).map((r) => r.frame);
  const clickRipple = clickFrames
    .map((cf) => {
      const dt = frame - cf;
      if (dt < 0 || dt > 18) return 0;
      return interpolate(dt, [0, 18], [1, 0]);
    })
    .reduce((a, b) => Math.max(a, b), 0);

  // Click press (scale down briefly)
  const isPressing = clickFrames.some((cf) => {
    const dt = frame - cf;
    return dt >= 0 && dt <= 6;
  });
  const pressScale = isPressing ? 0.88 : 1;

  const firstFrame = resolved[0].frame;
  const enterOpacity = interpolate(frame, [firstFrame, firstFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {clickRipple > 0 && (
        <div
          style={{
            position: "absolute",
            left: x - 24,
            top: y - 24,
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: `2.5px solid ${rippleColor}`,
            transform: `scale(${1 + (1 - clickRipple) * 2.2})`,
            opacity: clickRipple * 0.8,
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: x,
          top: y,
          pointerEvents: "none",
          opacity: enterOpacity,
          transform: `scale(${pressScale})`,
          transformOrigin: "top left",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.55))",
          zIndex: 9999,
        }}
      >
        <path
          d="M4 2l16 10-7 1.2-3.2 7.8z"
          fill={cursorColor}
          stroke={cursorOutline}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}
