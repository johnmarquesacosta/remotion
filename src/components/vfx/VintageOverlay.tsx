import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FilmGrain } from "./FilmGrain";

interface VintageOverlayProps {
  grainIntensity?: number;
  scratchOpacity?: number;
}

export const VintageOverlay: React.FC<VintageOverlayProps> = ({
  grainIntensity = 0.2,
  scratchOpacity = 0.05,
}) => {
  const frame = useCurrentFrame();
  // Riscos verticais aleatórios que aparecem esporadicamente
  const showScratch = (frame % 47 < 3);
  const scratchX = ((frame * 137) % 90) + 5; // posição pseudo-aleatória

  return (
    <>
      <FilmGrain intensity={grainIntensity} />
      {showScratch && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{
            position: "absolute",
            left: `${scratchX}%`,
            top: 0,
            width: 1,
            height: "100%",
            backgroundColor: "#FFFFFF",
            opacity: scratchOpacity,
          }} />
        </AbsoluteFill>
      )}
    </>
  );
};
