import React from "react";
import { AbsoluteFill } from "remotion";
import { FormatWrapper } from "../components/layout/FormatWrapper";
import { AnimatedGrid } from "../components/vfx/AnimatedGrid";
import { Vignette } from "../components/vfx/Vignette";
import { VintageOverlay } from "../components/vfx/VintageOverlay";
import { getTheme } from "../themes";
import type { VideoScript } from "../types/scene.types";

interface BaseCompositionProps {
  script: VideoScript;
  children: React.ReactNode;
  debugGrid?: boolean;
}

export const BaseComposition: React.FC<BaseCompositionProps> = ({
  script,
  children,
  debugGrid = false,
}) => {
  const theme = getTheme(script.channelId);

  return (
    <FormatWrapper theme={theme}>
      {/* Layer 1: Grid animado de fundo */}
      <AnimatedGrid
        color={theme.colors.grid}
        opacity={theme.vfx.gridOpacity}
        direction="down"
      />

      {/* Layer 2: Conteúdo das cenas */}
      <AbsoluteFill>
        {children}
      </AbsoluteFill>

      {/* Layer 3: Vignette */}
      <Vignette intensity={theme.vfx.vignetteIntensity} />

      {/* Layer 4: Vintage overlay (se o canal usar) */}
      {theme.vfx.useVintageOverlay && (
        <VintageOverlay grainIntensity={theme.vfx.filmGrainIntensity} />
      )}
    </FormatWrapper>
  );
};
