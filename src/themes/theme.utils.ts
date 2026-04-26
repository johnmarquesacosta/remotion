import chroma from "chroma-js";
import type { ChannelTheme } from "../types/channel.types";

// Gera variações de uma cor (lighter, darker, transparent)
export function colorVariants(hex: string) {
  const c = chroma(hex);
  return {
    base: hex,
    light: c.brighten(1).hex(),
    dark: c.darken(1).hex(),
    alpha: (opacity: number) => c.alpha(opacity).css(),
  };
}

// Converte tema em CSS vars (para uso em style={{}} no Remotion)
export function themeToCSSVars(theme: ChannelTheme): Record<string, string> {
  return {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-accent": theme.colors.accent,
    "--color-bg": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-text": theme.colors.text,
    "--color-text-muted": theme.colors.textMuted,
    "--color-grid": theme.colors.grid,
    "--color-highlight": theme.colors.highlight,
    "--font-style-a": theme.typography.styleA.family,
    "--font-style-b": theme.typography.styleB.family,
    "--font-caption": theme.typography.caption.family,
  };
}
