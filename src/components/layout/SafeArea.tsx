import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

export const SafeArea: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const isVertical = height > width;
  
  const padding = isVertical ? 80 : 40;

  return (
    <AbsoluteFill style={{ padding }}>
      {children}
    </AbsoluteFill>
  );
};
