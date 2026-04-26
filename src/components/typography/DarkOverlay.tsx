import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface DarkOverlayProps {
  startFrame?: number;
  fadeInFrames?: number;
  opacity?: number;
  children?: React.ReactNode;
}

export const DarkOverlay: React.FC<DarkOverlayProps> = ({
  startFrame = 0,
  fadeInFrames = 15,
  opacity = 0.6,
  children,
}) => {
  const frame = useCurrentFrame();
  const currentOpacity = interpolate(
    frame,
    [startFrame, startFrame + fadeInFrames],
    [0, opacity],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: currentOpacity }} />
      <AbsoluteFill style={{ zIndex: 1 }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
