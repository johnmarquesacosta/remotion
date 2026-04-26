import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

interface QuadrantGridProps {
  visible?: boolean;
  color?: string;
  opacity?: number;
}

export const QuadrantGrid: React.FC<QuadrantGridProps> = ({
  visible = false,
  color = "#FF0000",
  opacity = 0.3,
}) => {
  const { width, height } = useVideoConfig();
  if (!visible) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Linha vertical central */}
      <div style={{
        position: "absolute",
        left: width / 2,
        top: 0,
        width: 2,
        height: "100%",
        backgroundColor: color,
        opacity,
      }} />
      {/* Linha horizontal central */}
      <div style={{
        position: "absolute",
        top: height / 2,
        left: 0,
        width: "100%",
        height: 2,
        backgroundColor: color,
        opacity,
      }} />
      {/* Labels dos quadrantes */}
      {[
        { label: "Q1 TL", x: width * 0.25, y: height * 0.25 },
        { label: "Q2 TR", x: width * 0.75, y: height * 0.25 },
        { label: "Q3 BL", x: width * 0.25, y: height * 0.75 },
        { label: "Q4 BR", x: width * 0.75, y: height * 0.75 },
      ].map(({ label, x, y }) => (
        <div key={label} style={{
          position: "absolute",
          left: x - 30,
          top: y - 10,
          color,
          opacity,
          fontSize: 14,
          fontFamily: "monospace",
        }}>
          {label}
        </div>
      ))}
    </AbsoluteFill>
  );
};
