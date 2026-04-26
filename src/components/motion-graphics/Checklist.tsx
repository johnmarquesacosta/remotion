import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";

interface ChecklistItem {
  label: string;
  revealAtFrame: number;
}

interface ChecklistProps {
  items: ChecklistItem[];
  theme: ChannelTheme;
}

export const Checklist: React.FC<ChecklistProps> = ({ items, theme }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {items.map((item, i) => {
        const progress = interpolate(frame, [item.revealAtFrame, item.revealAtFrame + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const checked = frame >= item.revealAtFrame + 10;

        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, opacity: progress }}>
            <div style={{
              width: 32,
              height: 32,
              border: `2px solid ${theme.colors.accent}`,
              borderRadius: 6,
              backgroundColor: checked ? theme.colors.accent : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {checked && <span style={{ color: theme.colors.background, fontSize: 18, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{
              fontFamily: theme.typography.styleB.family,
              fontSize: 32,
              color: theme.colors.text,
            }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
