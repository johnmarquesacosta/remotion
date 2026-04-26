import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Vignette } from "../vfx/Vignette";

export interface StudioMonitorLayoutProps {
  /** Caminho da imagem (usar staticFile() ao passar) */
  src: string;
  /** Quanto a imagem de fundo é ampliada (1.1 = 110%) */
  backgroundScale?: number;
  /** Intensidade do blur do fundo (px) */
  blurAmount?: number;
  /** Intensidade da vinheta (0-1) */
  vignetteIntensity?: number;
  /** Opacidade das scanlines (0-1) */
  scanlinesOpacity?: number;
  /** Tamanho da imagem central em % da largura total */
  insertWidthPercent?: number;
  /** Frame em que a imagem central aparece */
  insertStartFrame?: number;
  /** Cor da borda da imagem central */
  borderColor?: string;
}

export const StudioMonitorLayout: React.FC<StudioMonitorLayoutProps> = ({
  src,
  backgroundScale = 1.15,
  blurAmount = 24,
  vignetteIntensity = 0.65,
  scanlinesOpacity = 0.04,
  insertWidthPercent = 55,
  insertStartFrame = 8,
  borderColor = "rgba(255,255,255,0.15)",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Animação de entrada da imagem central
  const insertScale = interpolate(frame, [insertStartFrame, insertStartFrame + 18], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const insertOpacity = interpolate(frame, [insertStartFrame, insertStartFrame + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const insertWidth = (width * insertWidthPercent) / 100;
  const insertHeight = (insertWidth * height) / width; // mantém aspect ratio

  return (
    <AbsoluteFill>
      {/* === CAMADA 1: Fundo ampliado e desfocado === */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${backgroundScale})`,
            filter: `blur(${blurAmount}px) brightness(0.7)`,
          }}
        />
      </AbsoluteFill>

      {/* === CAMADA 2: Scanlines (linhas de varredura horizontais) === */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, ${scanlinesOpacity}) 2px,
            rgba(0, 0, 0, ${scanlinesOpacity}) 4px
          )`,
          backgroundSize: "100% 4px",
        }}
      />

      {/* === CAMADA 3: Vinheta escura nas bordas === */}
      <Vignette intensity={vignetteIntensity} />

      {/* === CAMADA 4: Imagem central nítida (o "insert") === */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: insertWidth,
            height: insertHeight,
            transform: `scale(${insertScale})`,
            opacity: insertOpacity,
            boxShadow: `
              0 0 0 1px ${borderColor},
              0 20px 80px rgba(0,0,0,0.7),
              0 0 40px rgba(0,0,0,0.4)
            `,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Img
            src={src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
