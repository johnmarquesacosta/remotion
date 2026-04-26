import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";

interface ConnectorLinesProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  theme: ChannelTheme;
  startFrame?: number;
}

export const ConnectorLines: React.FC<ConnectorLinesProps> = ({ startX, startY, endX, endY, theme, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pathLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const strokeDashoffset = pathLength - progress * pathLength;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={theme.colors.textMuted}
          strokeWidth={2}
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </AbsoluteFill>
  );
};
