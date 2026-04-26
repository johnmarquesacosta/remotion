import { useCurrentFrame, useVideoConfig } from "remotion";

interface NarrationSync {
  isPlaying: boolean;
  progress: number; // 0 a 1
  currentFrame: number;
}

export function useNarration(startAtSecond: number, durationInSeconds: number): NarrationSync {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = startAtSecond * fps;
  const durationFrames = durationInSeconds * fps;
  const relativeFrame = frame - startFrame;

  return {
    isPlaying: relativeFrame >= 0 && relativeFrame <= durationFrames,
    progress: Math.min(1, Math.max(0, relativeFrame / durationFrames)),
    currentFrame: relativeFrame,
  };
}
