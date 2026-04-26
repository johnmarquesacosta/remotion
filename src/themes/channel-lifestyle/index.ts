import type { ChannelTheme } from "../../types/channel.types";

export const channelLifestyle = {
  id: "channel-lifestyle",
  name: "Canal Lifestyle",
  colors: {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFE66D",
    background: "#1A1A1A",
    surface: "#2D2D2D",
    text: "#FFFFFF",
    textMuted: "#AAAAAA",
    grid: "#FF6B6B",
    highlight: "#FFE66D66",
  },
  typography: {
    styleA: { family: "Montserrat", weight: 900, letterSpacing: -0.03, lineHeight: 1.0 },
    styleB: { family: "Nunito", weight: 400, letterSpacing: 0, lineHeight: 1.5 },
    caption: { family: "Montserrat", weight: 600, letterSpacing: 0.02, lineHeight: 1.2 },
  },
  vfx: {
    gridOpacity: 0.05,
    vignetteIntensity: 0.3,
    filmGrainIntensity: 0.0,
    useVintageOverlay: false,
    handheldIntensity: 0.2,
  },
  formats: {
    primary: "9:16",
    supported: ["9:16", "16:9"],
  },
} satisfies ChannelTheme;
