import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface ColorToGrayscaleProps {
  startFrame?: number;
  endFrame?: number;
  children: React.ReactNode;
}

export const ColorToGrayscale: React.FC<ColorToGrayscaleProps> = ({
  startFrame = 0,
  endFrame = 30,
  children,
}) => {
  const frame = useCurrentFrame();
  const saturation = interpolate(frame, [startFrame, endFrame], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ filter: `saturate(${saturation}%)` }}>
      {children}
    </AbsoluteFill>
  );
};
