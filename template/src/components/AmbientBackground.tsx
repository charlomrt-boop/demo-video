import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../theme";

export const AmbientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  // Very slow opacity breathing (no position/scale motion)
  const breathe1 = 0.9 + Math.sin(t * 0.15) * 0.1;
  const breathe2 = 0.9 + Math.cos(t * 0.12) * 0.1;

  // Particles: slow vertical drift, no jitter
  const particles = Array.from({ length: 18 }, (_, i) => {
    const seed = i * 137.5;
    const speedY = 0.25 + (i % 4) * 0.08;
    const baseY = (i * 137) % 100;
    const y = ((baseY - t * speedY * 4 + 200) % 120) - 10;
    const x = (seed % 100);
    const size = 2 + (i % 3);
    const opacity = 0.18 + ((i % 3) * 0.08);
    return { x, y, size, opacity, i };
  });

  return (
    <AbsoluteFill>
      {/* Cyan glow — static position */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "8%",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.26) 0%, rgba(34,211,238,0) 60%)",
          filter: "blur(40px)",
          opacity: breathe1,
          pointerEvents: "none",
        }}
      />
      {/* Violet glow — static position */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          right: "4%",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.24) 0%, rgba(139,92,246,0) 60%)",
          filter: "blur(40px)",
          opacity: breathe2,
          pointerEvents: "none",
        }}
      />
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.07,
          pointerEvents: "none",
        }}
      />
      {/* Slow-drifting particles */}
      {particles.map((p) => (
        <div
          key={p.i}
          style={{
            position: "absolute",
            top: `${p.y}%`,
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.i % 2 === 0 ? colors.primary : colors.accent,
            boxShadow: `0 0 ${p.size * 3}px ${
              p.i % 2 === 0 ? colors.primary : colors.accent
            }`,
            opacity: p.opacity,
            pointerEvents: "none",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
