import React from "react";
import { Composition, CalculateMetadataFunction } from "remotion";

import { DynamicVideo } from "./compositions/DynamicVideo";
import type { DynamicVideoProps } from "./compositions/DynamicVideo";
import { YamnayaVideo } from "./compositions/YamnayaVideo";

// Default script para o Studio preview (fallback quando nenhum videoId é passado)
const DEFAULT_SCRIPT: DynamicVideoProps["script"] = {
  videoId: "preview",
  channelId: "channel-default",
  format: "16:9",
  fps: 30,
  scenes: [
    {
      type: "title",
      durationInSeconds: 5,
      content: { title: "Preview — Selecione um vídeo" },
    },
  ],
};

/**
 * calculateMetadata busca o script.json do vídeo via API do dashboard
 * (roda tanto no Studio quanto no CLI de render).
 *
 * Para renderizar via CLI:
 *   npx remotion render DynamicVideo --props='{"videoId":"video-1777134303107"}'
 */
const calculateMetadata: CalculateMetadataFunction<DynamicVideoProps> = async ({
  props,
  abortSignal,
}) => {
  let script = props.script;

  // Se o videoId foi passado mas o script é o default, busca o script real
  if (props.videoId && props.videoId !== "preview") {
    try {
      const res = await fetch(
        `http://localhost:3333/api/script/${props.videoId}`,
        { signal: abortSignal }
      );
      if (res.ok) {
        script = await res.json();
      }
    } catch {
      // Fallback para o script default se não conseguir buscar
    }
  }

  const fps = script.fps ?? 30;
  const totalDuration = script.scenes.reduce(
    (sum: number, s: any) => sum + (s.durationInSeconds ?? 5),
    0
  );
  const totalFrames = Math.round(totalDuration * fps);

  return {
    durationInFrames: Math.max(totalFrames, 1),
    fps,
    width: script.format === "16:9" ? 1920 : 1080,
    height: script.format === "16:9" ? 1080 : 1920,
    props: {
      ...props,
      script,
    },
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="DynamicVideo"
      component={DynamicVideo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={
        {
          videoId: "preview",
          script: DEFAULT_SCRIPT,
        } as DynamicVideoProps
      }
      calculateMetadata={calculateMetadata}
    />
    <Composition
      id="YamnayaVideo"
      component={YamnayaVideo}
      durationInFrames={5160}
      fps={30}
      width={1920}
      height={1080}
    />
    </>
  );
};
