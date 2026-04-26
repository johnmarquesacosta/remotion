import React from "react";
import { Sequence, Html5Audio } from "remotion";
import { BaseComposition } from "./BaseComposition";
import { SceneRenderer } from "./SceneRenderer";

export type DynamicVideoProps = {
  videoId: string;
  script: {
    videoId: string;
    channelId: string;
    format: "16:9" | "9:16";
    fps?: number;
    scenes: Array<{
      id?: string;
      type: string;
      durationInSeconds: number;
      narration?: {
        file?: string;
        text?: string;
        startAtSecond?: number;
      };
      camera?: Record<string, unknown>;
      vfx?: Record<string, unknown>;
      content?: Record<string, unknown>;
      // Campos extras que a IA pode colocar fora de content
      [key: string]: unknown;
    }>;
  };
}

export const DynamicVideo: React.FC<DynamicVideoProps> = ({ videoId, script }) => {
  const fps = script.fps ?? 30;

  // Normaliza cenas: garante que cada cena tenha um `id` e `content`
  const normalizedScenes = script.scenes.map((scene, index) => {
    const id = scene.id ?? `scene-${String(index + 1).padStart(2, "0")}`;

    // Monta o content a partir dos campos extras (a IA pode gerar fora de "content")
    const content: Record<string, unknown> = { ...(scene.content ?? {}) };

    // Campos que a IA costuma colocar no nível raiz ao invés de dentro de content
    const extraContentKeys = [
      "title", "subtitle", "items", "cards", "highlight",
      "imageQuery", "imageFile", "caption", "layout", "timeline",
      "visual",
    ];
    for (const key of extraContentKeys) {
      if (scene[key] !== undefined && content[key] === undefined) {
        content[key] = scene[key];
      }
    }

    return {
      id,
      type: scene.type,
      durationInSeconds: scene.durationInSeconds,
      narration: scene.narration,
      camera: scene.camera,
      vfx: scene.vfx,
      content,
    };
  });

  // Calcula o frame de início de cada cena
  let currentFrame = 0;

  return (
    <BaseComposition
      script={{
        videoId: script.videoId,
        channelId: script.channelId,
        format: script.format,
        fps,
        scenes: normalizedScenes as any,
      }}
    >
      {normalizedScenes.map((scene, index) => {
        const durationFrames = Math.round(scene.durationInSeconds * fps);
        const startFrame = currentFrame;
        currentFrame += durationFrames;

        return (
          <Sequence
            key={scene.id}
            from={startFrame}
            durationInFrames={durationFrames}
            name={`${scene.id} (${scene.type})`}
          >
            {/* Áudio da narração */}
            {scene.narration?.file && (
              <Html5Audio
                src={`http://localhost:3333/videos/${videoId}/narration/${scene.narration.file}`}
                trimBefore={Math.round((scene.narration.startAtSecond ?? 0) * fps)}
              />
            )}

            {/* Renderiza cena pelo tipo */}
            <SceneRenderer
              scene={scene as any}
              channelId={script.channelId}
              videoId={videoId}
            />
          </Sequence>
        );
      })}
    </BaseComposition>
  );
};
