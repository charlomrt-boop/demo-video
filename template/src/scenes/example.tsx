/**
 * Example scene showing the anchor discipline.
 *
 *   1. Anchors live in ./example.anchors.ts
 *   2. Every targetable element is absolute-positioned via anchorStyle(ANCHORS[name])
 *   3. Cursor targets anchors by NAME, never raw coords
 *
 * DELETE this file once the init script has scaffolded real scenes.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, font } from "../theme";
import { SidePanelFrame } from "../components/SidePanelFrame";
import { Cursor } from "../components/Cursor";
import { anchorStyle } from "../lib/anchors";
import { ANCHORS } from "./example.anchors";

export const SceneExample: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      {/* position:relative wrapper — anchor coords are local to this box */}
      <div style={{ position: "relative" }}>
        <SidePanelFrame>
          <div style={{ padding: 20, flex: 1, position: "relative" }}>
            {/* Smart bar positioned via its anchor */}
            <div
              style={{
                ...anchorStyle(ANCHORS["smart-bar"]),
                padding: "14px 16px",
                background: colors.surface,
                border: `1px solid ${colors.primary}`,
                borderRadius: 10,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              linkedin.com/posts/example
            </div>

            {/* Primary button positioned via its anchor */}
            <div
              style={{
                ...anchorStyle(ANCHORS["primary-button"]),
                background: colors.gradient,
                borderRadius: 999,
                color: colors.white,
                fontFamily: font.heading,
                fontWeight: 700,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 22px rgba(34,211,238,0.35)",
              }}
            >
              Lancer
            </div>
          </div>
        </SidePanelFrame>

        {/* Cursor uses the same ANCHORS — guaranteed alignment */}
        <Cursor
          frame={frame}
          anchors={ANCHORS}
          keyframes={[
            { at: 0,  anchor: "smart-bar",      offset: { x: 0, y: 500 } },
            { at: 30, anchor: "smart-bar",      action: "click" },
            { at: 60, anchor: "smart-bar" },
            { at: 90, anchor: "primary-button", action: "click" },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};
