import type { VideoScript } from "../types/scene.types";
import { VideoScriptSchema } from "../types/scene.types";

export function useVideoScript(script: unknown): VideoScript {
  return VideoScriptSchema.parse(script);
}
