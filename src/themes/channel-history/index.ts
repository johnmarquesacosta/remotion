import type { ChannelTheme } from "../../types/channel.types";

export const channelHistory = {
  id: "channel-history",
  name: "Canal História",
  colors: {
    primary: "#2C1810",
    secondary: "#4A2C1A",
    accent: "#C8A96E",
    background: "#1A0F0A",
    surface: "#2C1810",
    text: "#F5E6D3",
    textMuted: "#A08060",
    grid: "#C8A96E",
    highlight: "#C8A96E55",
  },
  typography: {
    styleA: { family: "Playfair Display", weight: 700, letterSpacing: -0.01, lineHeight: 1.1 },
    styleB: { family: "EB Garamond", weight: 400, letterSpacing: 0.02, lineHeight: 1.6 },
    caption: { family: "EB Garamond", weight: 400, letterSpacing: 0.05, lineHeight: 1.3 },
  },
  vfx: {
    gridOpacity: 0.06,
    vignetteIntensity: 0.6,
    filmGrainIntensity: 0.3,
    useVintageOverlay: true,
    handheldIntensity: 0.5,
  },
  formats: {
    primary: "16:9",
    supported: ["16:9", "9:16"],
  },
} satisfies ChannelTheme;
