import React from "react";
import { AbsoluteFill } from "remotion";
import { themeToCSSVars } from "../../themes/theme.utils";
import type { ChannelTheme } from "../../types/channel.types";

interface FormatWrapperProps {
  theme: ChannelTheme;
  children: React.ReactNode;
}

export const FormatWrapper: React.FC<FormatWrapperProps> = ({ theme, children }) => {
  const cssVars = themeToCSSVars(theme);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.background,
        ...cssVars,
        fontFamily: theme.typography.styleA.family,
      } as React.CSSProperties}
    >
      {children}
    </AbsoluteFill>
  );
};
