import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easings } from "../../utils/easing";

interface ZoomFromCenterProps {
  from?: number;       // escala inicial (ex: 1)
  to?: number;         // escala final (ex: 1.5)
  startFrame?: number;
  endFrame?: number;
  children: React.ReactNode;
}

export const ZoomFromCenter: React.FC<ZoomFromCenterProps> = ({
  from = 1,
  to = 1.5,
  startFrame = 0,
  endFrame,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ef = endFrame ?? durationInFrames;

  const scale = interpolate(frame, [startFrame, ef], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.easeInOutQuad,
  });

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "50% 50%", // sempre centro geométrico
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
