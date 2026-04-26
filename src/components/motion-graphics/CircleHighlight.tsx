import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface CircleHighlightProps {
  /** Centro X do elemento a destacar */
  cx: number;
  /** Centro Y do elemento a destacar */
  cy: number;
  radius?: number;
  color?: string;
  startFrame?: number;
}

export const CircleHighlight: React.FC<CircleHighlightProps> = ({
  cx, cy, radius = 70, color = "#E94560", startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const totalLength = 2 * Math.PI * radius;

  const progress = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashOffset = totalLength * (1 - progress);

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={totalLength}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
      />
    </svg>
  );
};
