import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export interface SceneFadeProps {
  /** Quantos frames dura o fade-in no início da cena */
  fadeInFrames?: number;
  /** Quantos frames dura o fade-out no fim da cena */
  fadeOutFrames?: number;
  /** Total de frames da cena */
  totalFrames: number;
  children: React.ReactNode;
}

export const SceneFade: React.FC<SceneFadeProps> = ({
  fadeInFrames = 12,
  fadeOutFrames = 12,
  totalFrames,
  children,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, fadeInFrames, totalFrames - fadeOutFrames, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};
