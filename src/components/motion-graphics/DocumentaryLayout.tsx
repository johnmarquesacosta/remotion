import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
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
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      {imageSrc && (
        <Img
          src={imageSrc}
          style={{ maxWidth: "60%", maxHeight: "60%", border: `4px solid ${theme.colors.surface}` }}
        />
      )}
      {(title || subtitle) && (
        <div style={{
          position: "absolute",
          bottom: 100,
          backgroundColor: theme.colors.surface,
          padding: 20,
          borderLeft: `4px solid ${theme.colors.accent}`,
        }}>
          {title && <h2 style={{ margin: 0, color: theme.colors.text, fontFamily: theme.typography.styleA.family }}>{title}</h2>}
          {subtitle && <p style={{ margin: 0, marginTop: 8, color: theme.colors.textMuted, fontFamily: theme.typography.styleB.family }}>{subtitle}</p>}
        </div>
      )}
    </AbsoluteFill>
  );
};
