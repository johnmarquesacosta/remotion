import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

type Direction = "up" | "down" | "left" | "right";

interface AnimatedGridProps {
  color?: string;
  opacity?: number;
  cellSize?: number;
  speed?: number;       // pixels por frame
  direction?: Direction;
}

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({
  color = "#FFFFFF",
  opacity = 0.08,
  cellSize = 60,
  speed = 0.3,
  direction = "down",
}) => {
  const frame = useCurrentFrame();
  const offset = (frame * speed) % cellSize;

  const transforms: Record<Direction, string> = {
    down:  `translateY(${offset}px)`,
    up:    `translateY(-${offset}px)`,
    right: `translateX(${offset}px)`,
    left:  `translateX(-${offset}px)`,
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: -cellSize,
          transform: transforms[direction],
          backgroundImage: `
            linear-gradient(${color} 1px, transparent 1px),
            linear-gradient(90deg, ${color} 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};
