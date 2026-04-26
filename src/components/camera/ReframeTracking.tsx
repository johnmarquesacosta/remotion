import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easings } from "../../utils/easing";
import { ZOOM_ORIGINS, type ZoomOriginName } from "../../utils/grid";

interface ReframeTrackingProps {
  fromQuadrant: ZoomOriginName;
  startFrame?: number;
  endFrame?: number;
  children: React.ReactNode;
}

export const ReframeTracking: React.FC<ReframeTrackingProps> = ({
  fromQuadrant,
  startFrame = 0,
  endFrame,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const ef = endFrame ?? durationInFrames;

  const origin = ZOOM_ORIGINS[fromQuadrant];
  const targetX = (0.5 - origin.x) * width;
  const targetY = (0.5 - origin.y) * height;

  const tx = interpolate(frame, [startFrame, ef], [0, targetX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.easeInOutCubic,
  });

  const ty = interpolate(frame, [startFrame, ef], [0, targetY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.easeInOutCubic,
  });

  return (
    <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      {children}
    </AbsoluteFill>
  );
};
