import { z } from "zod";

export const FontStyleSchema = z.object({
  family: z.string(),
  weight: z.union([z.literal(300), z.literal(400), z.literal(600), z.literal(700), z.literal(900)]),
  letterSpacing: z.number().optional(),
  lineHeight: z.number().optional(),
});

export const ChannelThemeSchema = z.object({
  id: z.string(),
  name: z.string(),

  colors: z.object({
    primary: z.string(),       // Cor principal (hex)
    secondary: z.string(),     // Cor secundária
    accent: z.string(),        // Cor de destaque
    background: z.string(),    // Fundo padrão
    surface: z.string(),       // Superfícies (cards, overlays)
    text: z.string(),          // Texto principal
    textMuted: z.string(),     // Texto secundário
    grid: z.string(),          // Cor das linhas do grid animado
    highlight: z.string(),     // Cor do marca-texto
  }),

  typography: z.object({
    styleA: FontStyleSchema,   // Moderno (títulos, telas técnicas)
    styleB: FontStyleSchema,   // Histórico/Crônica (narração, legendas)
    caption: FontStyleSchema,  // Legendas documentais
  }),

  vfx: z.object({
    gridOpacity: z.number().min(0).max(1),
    vignetteIntensity: z.number().min(0).max(1),
    filmGrainIntensity: z.number().min(0).max(1),
    useVintageOverlay: z.boolean(),
    handheldIntensity: z.number().min(0).max(1), // 0 = sem tremor
  }),

  formats: z.object({
    primary: z.union([z.literal("16:9"), z.literal("9:16")]),
    supported: z.array(z.union([z.literal("16:9"), z.literal("9:16")])),
  }),
});

export type ChannelTheme = z.infer<typeof ChannelThemeSchema>;
export type FontStyle = z.infer<typeof FontStyleSchema>;
