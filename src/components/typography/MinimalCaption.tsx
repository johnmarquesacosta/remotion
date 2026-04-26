import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";

interface MinimalCaptionProps {
  text: string;
  theme: ChannelTheme;
  startFrame?: number;
}

export const MinimalCaption: React.FC<MinimalCaptionProps> = ({
  text,
  theme,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{
      position: "absolute",
      bottom: 60,
      left: "50%",
      transform: "translateX(-50%)",
      opacity,
      backgroundColor: theme.colors.accent,
      padding: "8px 16px",
      borderRadius: 4,
    }}>
      <span style={{
        fontFamily: theme.typography.caption.family,
        fontWeight: 600,
        fontSize: 18,
        color: theme.colors.background,
      }}>
        {text}
      </span>
    </div>
  );
};
