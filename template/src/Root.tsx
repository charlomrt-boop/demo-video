import React from "react";
import { Composition } from "remotion";
import { Demo } from "./Demo";

// NOTE: init.sh rewrites FPS, DURATION_SEC, resolution from storyboard.yaml.
const FPS = 30;
const DURATION_SEC = 40;
const WIDTH = 1920;
const HEIGHT = 1080;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DemoComposition"
      component={Demo}
      durationInFrames={FPS * DURATION_SEC}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
