import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { easings } from "../../utils/easing";

export const FadeInText: React.FC<{
  startFrame?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ startFrame = 0, children, style }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.easeOutExpo,
  });
  const translateY = interpolate(frame, [startFrame, startFrame + 15], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ ...style, opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  );
};
