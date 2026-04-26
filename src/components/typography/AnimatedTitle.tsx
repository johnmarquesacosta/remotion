import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";

interface AnimatedTitleProps {
  text: string;
  theme: ChannelTheme;
  style?: "A" | "B";
  delayBetweenLetters?: number; // frames
  startFrame?: number;
  color?: string;
  fontSize?: number;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  theme,
  style = "A",
  delayBetweenLetters = 2,
  startFrame = 0,
  color,
  fontSize = 80,
}) => {
  const frame = useCurrentFrame();
  const fontStyle = style === "A" ? theme.typography.styleA : theme.typography.styleB;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
      }}
    >
      <div
        style={{
          fontFamily: fontStyle.family,
          fontWeight: fontStyle.weight,
          fontSize,
          color: color ?? theme.colors.text,
          letterSpacing: `${(fontStyle.letterSpacing ?? 0) * fontSize}px`,
          lineHeight: fontStyle.lineHeight ?? 1.2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
          maxWidth: "100%",
        }}
      >
        {text.split("").map((char, i) => {
          const charStartFrame = startFrame + i * delayBetweenLetters;
          const progress = interpolate(frame, [charStartFrame, charStartFrame + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const opacity = progress;
          const translateY = interpolate(progress, [0, 1], [20, 0]);

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity,
                transform: `translateY(${translateY}px)`,
                whiteSpace: char === " " ? "pre" : "normal",
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
