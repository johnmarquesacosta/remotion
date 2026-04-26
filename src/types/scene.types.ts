import { z } from "zod";

// Tipos de cena disponíveis
export const SceneTypeSchema = z.union([
  z.literal("title"),               // Tela de título com AnimatedTitle
  z.literal("documentary-layout"),  // Layout documental centralizado
  z.literal("checklist"),           // Lista com checkboxes animados
  z.literal("icon-carousel"),       // Carrossel de ícones
  z.literal("timeline"),            // Linha do tempo
  z.literal("image-fullscreen"),    // Imagem em tela cheia com caption
  z.literal("text-highlight"),      // Texto com marca-texto progressivo
  z.literal("studio-monitor"),      // Estilo monitor de estúdio
  z.literal("custom"),              // Cena totalmente customizada
]);

export interface CarouselIcon {
  id: string;
  label: string;
  iconName: string;
  iconLibrary: "fi" | "md" | "fa" | "bs" | "hi" | "io5" | "ri" | "si";
}

export const ZoomOriginSchema = z.union([
  z.literal("center"),
  z.literal("top-left"),
  z.literal("top-right"),
  z.literal("bottom-left"),
  z.literal("bottom-right"),
]);

export const SceneSchema = z.object({
  id: z.string(),
  type: SceneTypeSchema,
  durationInSeconds: z.number(),

  narration: z.object({
    file: z.string().optional(),     // Caminho relativo em narration/
    text: z.string().optional(),     // Texto (para gerar TTS depois)
    startAtSecond: z.number().default(0),
  }).optional(),

  camera: z.object({
    zoom: z.object({
      from: z.number().default(1),
      to: z.number().default(1),
      origin: ZoomOriginSchema.default("center"),
      easingFn: z.string().default("easeInOutQuad"),
    }).optional(),
    reframe: z.boolean().default(false), // Ativa tracking de reenquadramento
    handheld: z.boolean().default(true),
  }).optional(),

  vfx: z.object({
    grayscale: z.boolean().default(false),
    vintageOverlay: z.boolean().default(false),
    gridVisible: z.boolean().default(true),
  }).optional(),

  content: z.record(z.string(), z.unknown()), // Dados específicos do tipo de cena
});

export const VideoScriptSchema = z.object({
  videoId: z.string(),
  channelId: z.string(),
  format: z.union([z.literal("16:9"), z.literal("9:16")]),
  fps: z.number().default(30),
  scenes: z.array(SceneSchema),
});

export type VideoScript = z.infer<typeof VideoScriptSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type SceneType = z.infer<typeof SceneTypeSchema>;
export type ZoomOrigin = z.infer<typeof ZoomOriginSchema>;
