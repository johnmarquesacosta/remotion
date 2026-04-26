import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";

export interface ProgressiveHighlightProps {
  text: string;
  theme: ChannelTheme;
  startFrame?: number;
  endFrame?: number;      // quando o texto deve estar 100% grifado
  showDarkOverlay?: boolean;
  fontSize?: number;
}

export const ProgressiveHighlight: React.FC<ProgressiveHighlightProps> = ({
  text,
  theme,
  startFrame = 10,
  endFrame = 100,
  showDarkOverlay = true,
  fontSize = 48,
}) => {
  const frame = useCurrentFrame();

  const overlayOpacity = interpolate(frame, [startFrame - 10, startFrame], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightProgress = interpolate(frame, [startFrame, endFrame], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    // Container relativo para o overlay ficar contido dentro da cena
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "0 120px",
        boxSizing: "border-box",
      }}
    >
      {/* Overlay escuro — position absolute para não vazar entre cenas */}
      {showDarkOverlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000",
            opacity: overlayOpacity,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Texto com marca-texto progressivo */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: theme.typography.styleB.family,
          fontSize,
          color: theme.colors.text,
          lineHeight: theme.typography.styleB.lineHeight ?? 1.5,
          textAlign: "center",
          maxWidth: "100%",
        }}
      >
        {/*
          Técnica de highlight: o span age como marca-texto via background linear-gradient.
          O fundo avança da esquerda para a direita conforme highlightProgress.
          A cor do texto permanece legível por cima.
        */}
        <span
          style={{
            background: `linear-gradient(
              to right,
              ${theme.colors.highlight || theme.colors.accent} ${highlightProgress}%,
              transparent ${highlightProgress}%
            )`,
            borderRadius: 4,
            padding: "6px 8px",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
