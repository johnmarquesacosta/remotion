import { staticFile } from "remotion";
import type { VideoAssets } from "../types/asset.types";

export function useAssets(videoId: string): VideoAssets {
  const basePath = `videos/${videoId}`;

  return {
    videoId,
    basePath,
    // Helpers para construir caminhos com staticFile
    images: new Proxy({} as Record<string, string>, {
      get: (_, key: string) => staticFile(`${basePath}/assets/images/${key}`),
    }),
    sfx: new Proxy({} as Record<string, string>, {
      get: (_, key: string) => staticFile(`${basePath}/assets/sfx/${key}`),
    }),
    narration: new Proxy({} as Record<string, string>, {
      get: (_, key: string) => staticFile(`${basePath}/narration/${key}`),
    }),
  };
}
