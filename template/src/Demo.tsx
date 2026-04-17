import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { colors, font } from "./theme";
import { AmbientBackground } from "./components/AmbientBackground";

// NOTE: init.sh populates this file with <Sequence> entries derived from
// storyboard.yaml (one per scene). Scene components live in src/scenes/.
// Imports below are expected to be added as scenes are scaffolded.

// import { SceneIntro } from "./scenes/intro";
// import { SceneXxx } from "./scenes/xxx";

export const Demo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        fontFamily: font.body,
        color: colors.text,
      }}
    >
      <AmbientBackground />

      {/* <Sequence from={0} durationInFrames={90}> <SceneIntro /> </Sequence> */}

      <Audio src={staticFile("lofi.mp3")} volume={0.55} />
    </AbsoluteFill>
  );
};
