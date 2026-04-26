import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

interface FilmGrainProps {
  intensity?: number;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({ intensity = 0.15 }) => {
  const frame = useCurrentFrame();

  // SVG filter com feTurbulence animado por seed (muda a cada frame)
  const seed = frame % 1000;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: intensity }}>
      <svg width="100%" height="100%" style={{ position: "absolute" }}>
        <filter id={`grain-${frame}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};
