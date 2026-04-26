import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { easings } from "../../utils/easing";

export const SceneSlideUp: React.FC<{ totalFrames: number; children: React.ReactNode }> = ({
  totalFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.easeOutExpo,
  });
  const outProgress = interpolate(frame, [totalFrames - 12, totalFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(progress, [0, 1], [40, 0]);
  const opacity = progress * (1 - outProgress);

  return (
    <AbsoluteFill style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </AbsoluteFill>
  );
};
