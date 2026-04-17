import React from "react";
import { colors, font } from "../theme";

export const SidePanelFrame: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
}> = ({ children, width = 520, height = 860 }) => {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: colors.bg,
        borderRadius: 28,
        border: `1px solid ${colors.border}`,
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.15), 0 0 60px rgba(34,211,238,0.12)",
        overflow: "hidden",
        fontFamily: font.body,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: colors.gradient,
            boxShadow: "0 0 18px rgba(34,211,238,0.4)",
          }}
        />
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: font.heading,
            letterSpacing: -0.3,
          }}
        >
          LiCleads
        </div>
        <div
          style={{
            marginLeft: "auto",
            width: 8,
            height: 8,
            borderRadius: 999,
            background: colors.success,
            boxShadow: `0 0 10px ${colors.success}`,
          }}
        />
      </div>

      {children}
    </div>
  );
};
