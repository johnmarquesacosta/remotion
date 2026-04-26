import type { ChannelTheme } from "../../types/channel.types";

export const channelDefault = {
  id: "channel-default",
  name: "Canal Padrão",
  colors: {
    primary: "#1A1A2E",
    secondary: "#16213E",
    accent: "#E94560",
    background: "#0F0F1A",
    surface: "#1A1A2E",
    text: "#EAEAEA",
    textMuted: "#888899",
    grid: "#FFFFFF",
    highlight: "#E9456066",
  },
  typography: {
    styleA: { family: "Inter", weight: 700, letterSpacing: -0.02, lineHeight: 1.1 },
    styleB: { family: "Playfair Display", weight: 400, letterSpacing: 0.01, lineHeight: 1.4 },
    caption: { family: "JetBrains Mono", weight: 400, letterSpacing: 0.05, lineHeight: 1.2 },
  },
  vfx: {
    gridOpacity: 0.08,
    vignetteIntensity: 0.4,
    filmGrainIntensity: 0.15,
    useVintageOverlay: false,
    handheldIntensity: 0.3,
  },
  formats: {
    primary: "16:9",
    supported: ["16:9", "9:16"],
  },
} satisfies ChannelTheme;
