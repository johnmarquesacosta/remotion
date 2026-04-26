import type { ChannelTheme } from "../../types/channel.types";

export const channelTech = {
  id: "channel-tech",
  name: "Canal Tech",
  colors: {
    primary: "#0D1117",
    secondary: "#161B22",
    accent: "#58A6FF",
    background: "#010409",
    surface: "#21262D",
    text: "#F0F6FC",
    textMuted: "#8B949E",
    grid: "#58A6FF",
    highlight: "#58A6FF44",
  },
  typography: {
    styleA: { family: "JetBrains Mono", weight: 700, letterSpacing: -0.01, lineHeight: 1.0 },
    styleB: { family: "Inter", weight: 300, letterSpacing: 0.02, lineHeight: 1.5 },
    caption: { family: "JetBrains Mono", weight: 400, letterSpacing: 0.08, lineHeight: 1.2 },
  },
  vfx: {
    gridOpacity: 0.12,
    vignetteIntensity: 0.5,
    filmGrainIntensity: 0.05,
    useVintageOverlay: false,
    handheldIntensity: 0.1,
  },
  formats: {
    primary: "16:9",
    supported: ["16:9", "9:16"],
  },
} satisfies ChannelTheme;
