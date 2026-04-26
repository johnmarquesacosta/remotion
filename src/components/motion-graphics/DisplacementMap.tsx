import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

interface DisplacementMapProps {
  children: React.ReactNode;
  intensity?: number;
}

export const DisplacementMap: React.FC<DisplacementMapProps> = ({ children, intensity = 0.05 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 1000;

  return (
    <AbsoluteFill>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="displacement">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" seed={seed} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={intensity * 100} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div style={{ width: "100%", height: "100%", filter: "url(#displacement)" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
