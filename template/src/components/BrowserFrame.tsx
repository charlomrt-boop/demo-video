import React from "react";
import { colors, font } from "../theme";

/**
 * Mock browser window. Exposes the URL bar as its own positioned zone
 * (the rect we expose is in component-local coordinates).
 */
export const BrowserFrame: React.FC<{
  url: string;
  children: React.ReactNode;
  urlHighlighted?: boolean;
  width?: number;
  height?: number;
  copiedToast?: boolean;
}> = ({
  url,
  children,
  urlHighlighted = false,
  width = 1380,
  height = 860,
  copiedToast = false,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 18,
        overflow: "hidden",
        background: "#F3F2EF", // LinkedIn bg tone
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
        fontFamily: font.body,
        color: "#000",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 42,
          background: "#1E1F22",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 8,
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div
            key={c}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
        <div style={{ flex: 1 }} />
      </div>
      {/* URL bar */}
      <div
        style={{
          height: 52,
          background: "#2A2B2F",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 10,
        }}
      >
        <div style={{ color: "#94A3B8", fontSize: 14 }}>←</div>
        <div style={{ color: "#94A3B8", fontSize: 14 }}>→</div>
        <div style={{ color: "#94A3B8", fontSize: 14 }}>⟳</div>
        <div
          style={{
            flex: 1,
            height: 30,
            background: urlHighlighted ? "#1E3A5F" : "#1F2024",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            color: urlHighlighted ? colors.white : "#CBD5E1",
            fontSize: 13,
            fontFamily: "'SF Mono', monospace",
            outline: urlHighlighted
              ? `2px solid ${colors.primary}`
              : "none",
            transition: "all 0.2s",
          }}
        >
          <span style={{ color: "#64748B", marginRight: 4 }}>🔒</span>
          {url}
        </div>
      </div>

      {/* LinkedIn content */}
      <div
        style={{
          height: height - 42 - 52,
          overflow: "hidden",
          background: "#F3F2EF",
          position: "relative",
        }}
      >
        {children}
      </div>

      {/* Copied toast */}
      {copiedToast && (
        <div
          style={{
            position: "absolute",
            top: 110,
            right: 24,
            padding: "10px 18px",
            background: colors.bg,
            color: colors.white,
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: font.heading,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            border: `1px solid ${colors.primary}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 10,
          }}
        >
          <span style={{ color: colors.success }}>✓</span>
          URL copiée
        </div>
      )}
    </div>
  );
};
