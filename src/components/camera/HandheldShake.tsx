import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";

interface HandheldShakeProps {
  intensity?: number; // 0 a 1
  speed?: number;
  children: React.ReactNode;
}

export const HandheldShake: React.FC<HandheldShakeProps> = ({
  intensity = 0.3,
  speed = 0.5,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = frame * speed * 0.01;

  const dx = noise2D("shake-x", t, 0) * intensity * 8;
  const dy = noise2D("shake-y", 0, t) * intensity * 5;
  const drot = noise2D("shake-r", t, t * 0.5) * intensity * 0.3;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${dx}px, ${dy}px) rotate(${drot}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
