import { interpolate } from "remotion";

export const BPM = 80;
export const FPS = 30;

// Frames per beat at 80 BPM, 30fps = 22.5 frames
export const framesPerBeat = (60 / BPM) * FPS;

// Sharp beat pulse (attack fast, release fast). Returns 0..1
export function beatPulse(frame: number) {
  const phase = frame / framesPerBeat;
  const frac = phase - Math.floor(phase);
  return Math.pow(1 - frac, 6);
}

// Softer beat pulse for gentler elements
export function beatPulseSoft(frame: number) {
  const phase = frame / framesPerBeat;
  const frac = phase - Math.floor(phase);
  return Math.pow(1 - frac, 3);
}

// Enter with scale+blur, stay, exit same way
export function sceneTransition(
  frame: number,
  duration: number,
  transitionFrames = 18
) {
  const enterOpacity = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [duration - transitionFrames, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(enterOpacity, exitOpacity);

  const enterScale = interpolate(frame, [0, transitionFrames], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(
    frame,
    [duration - transitionFrames, duration],
    [1, 1.04],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scale = Math.min(enterScale, exitScale);

  const enterBlur = interpolate(frame, [0, transitionFrames], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitBlur = interpolate(
    frame,
    [duration - transitionFrames, duration],
    [0, 10],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const blur = Math.max(enterBlur, exitBlur);

  return { opacity, scale, blur };
}

// Slow ken-burns zoom per scene
export function kenBurns(frame: number, duration: number, amount = 0.05) {
  return 1 + (frame / duration) * amount;
}

// Typewriter : returns the # of characters revealed
export function typewriter(
  frame: number,
  start: number,
  cps: number,
  total: number
) {
  const chars = Math.floor((frame - start) * (cps / FPS));
  return Math.max(0, Math.min(total, chars));
}

// Count-up number
export function countUp(
  frame: number,
  start: number,
  duration: number,
  target: number
) {
  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // ease out
  const eased = 1 - Math.pow(1 - progress, 3);
  return Math.floor(eased * target);
}
