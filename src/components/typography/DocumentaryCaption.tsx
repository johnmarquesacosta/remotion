import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";

interface DocumentaryCaptionProps {
  name: string;
  date?: string;
  theme: ChannelTheme;
  position?: "bottom-left" | "bottom-right";
  startFrame?: number;
}

export const DocumentaryCaption: React.FC<DocumentaryCaptionProps> = ({
  name,
  date,
  theme,
  position = "bottom-left",
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const alignRight = position === "bottom-right";

  return (
    <div style={{
      position: "absolute",
      bottom: 40,
      left: alignRight ? "auto" : 40,
      right: alignRight ? 40 : "auto",
      opacity,
      borderLeft: alignRight ? "none" : `3px solid ${theme.colors.accent}`,
      borderRight: alignRight ? `3px solid ${theme.colors.accent}` : "none",
      paddingLeft: alignRight ? 0 : 12,
      paddingRight: alignRight ? 12 : 0,
    }}>
      <div style={{
        fontFamily: theme.typography.caption.family,
        fontSize: 22,
        color: theme.colors.text,
        fontWeight: theme.typography.caption.weight,
      }}>
        {name}
      </div>
      {date && (
        <div style={{
          fontFamily: theme.typography.caption.family,
          fontSize: 16,
          color: theme.colors.textMuted,
          marginTop: 4,
        }}>
          {date}
        </div>
      )}
    </div>
  );
};
