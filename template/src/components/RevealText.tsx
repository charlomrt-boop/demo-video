import React from "react";
import { interpolate } from "remotion";

// Animates each character in sequence with scale+opacity+blur rise
export const RevealText: React.FC<{
  text: string;
  frame: number;
  start?: number;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ text, frame, start = 0, stagger = 1.2, style }) => {
  return (
    <span style={{ display: "inline-block", ...style }}>
      {text.split("").map((ch, i) => {
        const s = start + i * stagger;
        const opacity = interpolate(frame, [s, s + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(frame, [s, s + 10], [22, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const blur = interpolate(frame, [s, s + 10], [8, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${y}px)`,
              filter: `blur(${blur}px)`,
              whiteSpace: "pre",
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};
