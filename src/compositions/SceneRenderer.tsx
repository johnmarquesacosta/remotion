import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { getTheme } from "../themes";

// Components
import { AnimatedTitle } from "../components/typography/AnimatedTitle";
import { DocumentaryLayout } from "../components/motion-graphics/DocumentaryLayout";
import { ProgressiveHighlight } from "../components/typography/ProgressiveHighlight";
import { IconCarousel } from "../components/motion-graphics/IconCarousel";
import { Timeline } from "../components/motion-graphics/Timeline";
import { Checklist } from "../components/motion-graphics/Checklist";
import { StudioMonitorLayout } from "../components/layout/StudioMonitorLayout";
import { HandheldShake } from "../components/camera/HandheldShake";
import { SceneFade } from "../components/transitions/SceneFade";
import { SceneSlideUp } from "../components/transitions/SceneSlideUp";
import type { NormalizedScene, CarouselIcon } from "../types/scene.types";

interface SceneRendererProps {
  scene: NormalizedScene;
  channelId: string;
  videoId: string;
  sceneIndex: number;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  scene,
  channelId,
  videoId,
  sceneIndex,
}) => {
  const theme = getTheme(channelId);
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Helper to get image URL from the dashboard server
  const getImageUrl = (imageFile?: string) => {
    if (!imageFile) return undefined;
    return `http://localhost:3333/videos/${videoId}/assets/${imageFile}`;
  };

  // Bug fix #1: read imageFile from scene.content (not scene root)
  const imageSrc = getImageUrl(scene.content?.imageFile as string | undefined);
  const durationFrames = Math.round((scene.durationInSeconds || 5) * fps);

  // Bug fix #2: zoom applied ONLY to background image, not to text/overlays
  const imageScale = interpolate(frame, [0, durationFrames], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Common background image with subtle Ken-Burns zoom
  const BackgroundImage = () => {
    if (!imageSrc) return null;
    return (
      <Img
        src={imageSrc}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.4,
          transform: `scale(${imageScale})`,
          transformOrigin: "center center",
        }}
      />
    );
  };

  const renderScene = () => {
    switch (scene.type) {
    case "title":
      return (
        <AbsoluteFill style={{ backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
          <BackgroundImage />
          <AnimatedTitle
            text={(scene.content?.title as string | undefined) || "Título do Vídeo"}
            theme={theme}
          />
        </AbsoluteFill>
      );

    case "documentary-layout": {
      const infoBox = (scene.content?.infoBoxes as Array<{ title?: string; text?: string }> | undefined)?.[0];
      return (
        <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
          <DocumentaryLayout
            theme={theme}
            imageSrc={imageSrc}
            title={infoBox?.title}
            subtitle={infoBox?.text}
          />
        </AbsoluteFill>
      );
    }

    case "text-highlight":
      return (
        <AbsoluteFill style={{ backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
          <BackgroundImage />
          <ProgressiveHighlight
            text={scene.narration?.text || "Texto em destaque"}
            startFrame={10}
            endFrame={durationFrames - 10}
            theme={theme}
          />
        </AbsoluteFill>
      );

    case "icon-carousel": {
      const cards = scene.content?.cards as Array<{ title: string; icon?: string }> | undefined ?? [];
      // Bug fix #3: build icons with emoji fallback instead of missing iconName/iconLibrary
      const emojiMap: Record<string, string> = {
        dna: "🧬",
        "arrow-west": "⬅️",
        "timeline-dot": "⏳",
      };
      const icons: CarouselIcon[] = cards.map((c, i) => ({
        id: `icon-${i}`,
        label: c.title,
        emoji: c.icon ? (emojiMap[c.icon] ?? "📌") : "📌",
      }));
      const framesPerItem = Math.floor(durationFrames / Math.max(1, icons.length));

      return (
        <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
          <BackgroundImage />
          <IconCarousel
            icons={icons}
            framesPerItem={framesPerItem}
            theme={theme}
          />
        </AbsoluteFill>
      );
    }

    case "timeline": {
      const markers = (scene.content?.markers as Array<{ value?: string; label?: string }> | undefined) ?? [];
      const events = markers.map((m, i) => ({
        label: m.value ?? m.label ?? "",
        revealFrame: 10 + (i * 30),
      }));

      return (
        <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
          <BackgroundImage />
          <Timeline
            events={events}
            theme={theme}
          />
        </AbsoluteFill>
      );
    }

    case "checklist": {
      const itemsRaw = (scene.content?.items as string[] | undefined) ?? [];
      const items = itemsRaw.map((label, i) => ({
        label,
        revealAtFrame: 10 + (i * 20),
      }));

      return (
        <AbsoluteFill style={{ backgroundColor: theme.colors.background, padding: 100, justifyContent: "center" }}>
          <BackgroundImage />
          <div style={{ position: "relative", zIndex: 1 }}>
            <Checklist
              items={items}
              theme={theme}
            />
          </div>
        </AbsoluteFill>
      );
    }

    case "image-fullscreen": {
      // Bug fix #1 (also): caption lives in scene.content, not scene root
      const caption = scene.content?.caption as string | undefined;
      return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          {imageSrc && (
            <Img
              src={imageSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${imageScale})`,
                transformOrigin: "center center",
              }}
            />
          )}
          {caption && (
            <AbsoluteFill style={{ justifyContent: "flex-end", padding: "80px", alignItems: "center" }}>
              <h2 style={{
                color: "white",
                fontSize: "60px",
                fontFamily: theme.typography.styleA.family,
                textShadow: "0px 4px 20px rgba(0,0,0,0.9)",
                textAlign: "center",
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: "20px 40px",
                borderRadius: 20,
              }}>
                {caption}
              </h2>
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      );
    }

    case "studio-monitor": {
      const { imageSrc: studioImage, ...rest } = scene.content ?? {};
      return (
        <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
          <StudioMonitorLayout
            src={getImageUrl(studioImage as string) ?? ""}
            {...(rest as Record<string, unknown>)}
          />
        </AbsoluteFill>
      );
    }

    default:
      return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background }}>
          <BackgroundImage />
          <h1 style={{ color: theme.colors.text, fontFamily: theme.typography.styleA.family, position: "relative", zIndex: 1 }}>
            Scene: {scene.id} ({scene.type})
          </h1>
        </AbsoluteFill>
      );
    }
  };

  // Bug fix #4: alternate transitions — title/first scene → SceneFade, odd scenes → SceneSlideUp
  const Transition = sceneIndex === 0 || scene.type === "title"
    ? SceneFade
    : sceneIndex % 2 === 0
      ? SceneFade
      : SceneSlideUp;

  return (
    <HandheldShake intensity={theme.vfx?.handheldIntensity ?? 0.02}>
      {/* ZoomFromCenter removed from here — zoom is now only on BackgroundImage */}
      <Transition totalFrames={durationFrames}>
        {renderScene()}
      </Transition>
    </HandheldShake>
  );
};
