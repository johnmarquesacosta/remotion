import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { staticFile } from "remotion";

/**
 * Retorna a duração em frames de uma cena.
 * Se houver narração, usa a duração REAL do arquivo de áudio + padding.
 * Se não houver narração, usa durationInSeconds do script.
 */
export async function calculateSceneDuration(
  narrationFile: string | undefined,
  fallbackSeconds: number,
  fps: number,
  paddingSeconds = 0.5
): Promise<number> {
  if (!narrationFile) {
    return Math.round(fallbackSeconds * fps);
  }

  try {
    const src = staticFile(`narration/${narrationFile}`);
    const audioDuration = await getAudioDurationInSeconds(src);
    return Math.round((audioDuration + paddingSeconds) * fps);
  } catch {
    console.warn(`[useSceneDuration] Não foi possível ler ${narrationFile}. Usando fallback.`);
    return Math.round(fallbackSeconds * fps);
  }
}
