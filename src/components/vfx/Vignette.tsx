import React from "react";
import { AbsoluteFill } from "remotion";

interface VignetteProps {
  intensity?: number; // 0 a 1
  color?: string;
}

export const Vignette: React.FC<VignetteProps> = ({
  intensity = 0.4,
  color = "#000000",
}) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 40%, ${color}${Math.round(intensity * 255).toString(16).padStart(2, "0")} 100%)`,
        mixBlendMode: "multiply",
      }}
    />
  );
};
