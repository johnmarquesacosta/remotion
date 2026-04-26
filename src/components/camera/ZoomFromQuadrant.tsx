import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easings } from "../../utils/easing";
import { getZoomOriginPx, type ZoomOriginName } from "../../utils/grid";

interface ZoomFromQuadrantProps {
  origin: ZoomOriginName;
  from?: number;
  to?: number;
  startFrame?: number;
  endFrame?: number;
  children: React.ReactNode;
}

export const ZoomFromQuadrant: React.FC<ZoomFromQuadrantProps> = ({
  origin,
  from = 1,
  to = 2,
  startFrame = 0,
  endFrame,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const ef = endFrame ?? durationInFrames;

  const scale = interpolate(frame, [startFrame, ef], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.easeInOutCubic,
  });

  const originPx = getZoomOriginPx(origin, width, height);
  const transformOrigin = `${originPx.x}px ${originPx.y}px`;

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin }}>
      {children}
    </AbsoluteFill>
  );
};
