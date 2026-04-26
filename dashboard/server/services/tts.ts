import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export type TTSProvider = "kokoro" | "omnivoice";

interface TTSConfig {
  url: string;
  buildBody: (text: string) => string;
  audioFormat: "wav" | "mp3";
}

const CONFIGS: Record<TTSProvider, TTSConfig> = {
  kokoro: {
    url: "http://localhost:8881/v1/audio/speech",
    buildBody: (text) => JSON.stringify({
      model: "kokoro",
      input: text,
      voice: process.env.KOKORO_VOICE ?? "pm_alex",
      response_format: "mp3",
      speed: parseFloat(process.env.TTS_SPEED ?? "1.0"),
      lang_code: "p",
      normalization_options: {
        normalize: true,
        unit_normalization: false,
        url_normalization: true,
        email_normalization: true,
        optional_pluralization_normalization: true
      }
    }),
    audioFormat: "mp3",
  },
  omnivoice: {
    url: "http://localhost:7860/api/tts",
    buildBody: (text) => JSON.stringify({
      text,
      speaker_id: parseInt(process.env.OMNIVOICE_SPEAKER ?? "0"),
      language: process.env.OMNIVOICE_LANG ?? "pt",
    }),
    audioFormat: "wav",
  },
};

export async function generateAudio(
  text: string,
  outputPath: string,
  provider: TTSProvider = "kokoro"
): Promise<void> {
  const config = CONFIGS[provider];

  const response = await fetch(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: config.buildBody(text),
  });

  if (!response.ok) {
    throw new Error(`TTS ${provider} falhou: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

/**
 * Tenta gerar o áudio TTS com retry automático.
 * @param text       - Texto a ser narrado
 * @param outputPath - Caminho do arquivo de saída
 * @param provider   - Provedor TTS
 * @param maxAttempts - Número máximo de tentativas (padrão: 3)
 * @param onRetry    - Callback chamado a cada nova tentativa (recebe número da tentativa e erro anterior)
 */
export async function generateAudioWithRetry(
  text: string,
  outputPath: string,
  provider: TTSProvider = "kokoro",
  maxAttempts = 3,
  onRetry?: (attempt: number, error: Error) => void
): Promise<void> {
  let lastError: Error = new Error("Nenhuma tentativa realizada");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await generateAudio(text, outputPath, provider);
      return; // sucesso — sai imediatamente
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxAttempts) {
        const waitMs = Math.pow(2, attempt) * 1000; // backoff: 2s, 4s, 8s...
        onRetry?.(attempt, lastError);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw new Error(
    `TTS falhou após ${maxAttempts} tentativa(s). Último erro: ${lastError.message}`
  );
}
