import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";

interface TimelineEvent {
  label: string;
  revealFrame: number;
}

interface TimelineProps {
  events: TimelineEvent[];
  theme: ChannelTheme;
}

export const Timeline: React.FC<TimelineProps> = ({ events, theme }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: "80%", height: 4, backgroundColor: theme.colors.surface }}>
        {events.map((event, i) => {
          const progress = interpolate(frame, [event.revealFrame, event.revealFrame + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const xPos = `${(i / Math.max(1, events.length - 1)) * 100}%`;

          return (
            <div key={i} style={{
              position: "absolute",
              left: xPos,
              top: "50%",
              transform: "translate(-50%, -50%)",
              opacity: progress,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
              <div style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: theme.colors.accent,
                boxShadow: `0 0 10px ${theme.colors.accent}`,
              }} />
              <div style={{
                marginTop: 16,
                fontFamily: theme.typography.styleB.family,
                color: theme.colors.text,
                fontSize: 20,
                whiteSpace: "nowrap",
                transform: `translateY(${interpolate(progress, [0, 1], [10, 0])}px)`,
              }}>
                {event.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
