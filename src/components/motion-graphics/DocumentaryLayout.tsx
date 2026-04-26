import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";

interface DocumentaryLayoutProps {
  imageSrc?: string;
  theme: ChannelTheme;
  title?: string;
  subtitle?: string;
}

export const DocumentaryLayout: React.FC<DocumentaryLayoutProps> = ({
  imageSrc,
  theme,
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const slideUp = interpolate(frame, [10, 35], [40, 0], { extrapolateRight: "clamp" });
  
  // Efeito de zoom na imagem nítida central (Ken Burns invertido/scale)
  const imageScale = interpolate(frame, [0, durationInFrames], [0.72, 0.8], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      {/* Fundo de tela cheia com blur */}
      {imageSrc && (
        <>
          <Img
            src={imageSrc}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(18px) brightness(0.4) saturate(1.2)",
              transform: "scale(1.08)", // compensa o crop do blur nas bordas
              transformOrigin: "center center",
            }}
          />
          {/* Imagem nítida animada (zoom progressivo até 0.8) */}
          <Img
            src={imageSrc}
            style={{
              position: "absolute",
              width: width,
              height: height,
              objectFit: "cover",
              borderRadius: 24,
              top: 0,
              left: 0,
              transform: `scale(${imageScale}) translateY(-8%)`,
              transformOrigin: "center center",
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              border: `4px solid ${theme.colors.accent}66`,
            }}
          />
        </>
      )}

      {/* Caixa de texto na parte inferior */}
      {(title || subtitle) && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 80,
          }}
        >
          <div
            style={{
              transform: `translateY(${slideUp}px)`,
              backgroundColor: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(8px)",
              borderLeft: `6px solid ${theme.colors.accent}`,
              padding: "24px 40px",
              borderRadius: "0 12px 12px 0",
              maxWidth: "70%",
            }}
          >
            {title && (
              <h2
                style={{
                  margin: 0,
                  color: theme.colors.text,
                  fontFamily: theme.typography.styleA.family,
                  fontSize: 52,
                  fontWeight: 700,
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  margin: 0,
                  marginTop: 10,
                  color: theme.colors.textMuted,
                  fontFamily: theme.typography.styleB.family,
                  fontSize: 32,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
