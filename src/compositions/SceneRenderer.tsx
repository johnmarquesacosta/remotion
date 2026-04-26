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
    return `http://localhost:3333/videos/${videoId}/assets/images/${imageFile}`;
  };

  // Reads imageFile from scene.content (normalized from props/root by DynamicVideo)
  const imageSrc = getImageUrl(scene.content?.imageFile as string | undefined);
  const durationFrames = Math.round((scene.durationInSeconds || 5) * fps);

  // Ken-Burns zoom applied ONLY to background image, not to text/overlays
  const imageScale = interpolate(frame, [0, durationFrames], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /**
   * Background image component with Ken-Burns zoom.
   * overlayOpacity: how dark the overlay is (0 = no overlay, 1 = fully black)
   * imageOpacity: base opacity of the image itself (default 1 for full color, 0.5 for muted)
   */
  const BackgroundImage = ({
    overlayOpacity = 0.55,
    imageOpacity = 1,
  }: {
    overlayOpacity?: number;
    imageOpacity?: number;
  }) => {
    if (!imageSrc) return null;
    return (
      <>
        {/* The image itself with Ken-Burns */}
        <Img
          src={imageSrc}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: imageOpacity,
            transform: `scale(${imageScale})`,
            transformOrigin: "center center",
          }}
        />
        {/* Dark overlay for readability */}
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          }}
        />
      </>
    );
  };

  const renderScene = () => {
    switch (scene.type) {
    case "title": {
      const titleText = (scene.content?.title as string | undefined) || (scene.content?.text as string | undefined) || "Título do Vídeo";
      return (
        <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
          <BackgroundImage overlayOpacity={0.5} imageOpacity={1} />
          <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
            <AnimatedTitle
              text={titleText}
              theme={theme}
            />
          </div>
        </AbsoluteFill>
      );
    }

    case "documentary-layout": {
      const infoBox = (scene.content?.infoBoxes as Array<{ title?: string; text?: string }> | undefined)?.[0];
      return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          <BackgroundImage overlayOpacity={0.35} imageOpacity={1} />
          <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
            <DocumentaryLayout
              theme={theme}
              imageSrc={imageSrc}
              title={infoBox?.title}
              subtitle={infoBox?.text}
            />
          </div>
        </AbsoluteFill>
      );
    }

    case "text-highlight":
      return (
        <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
          {/* Darker overlay so the highlight text is very readable over the image */}
          <BackgroundImage overlayOpacity={0.65} imageOpacity={1} />
          <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
            <ProgressiveHighlight
              text={(scene.content?.text as string | undefined) || scene.narration?.text || "Texto em destaque"}
              startFrame={10}
              endFrame={durationFrames - 10}
              theme={theme}
            />
          </div>
        </AbsoluteFill>
      );

    case "icon-carousel": {
      const cards = scene.content?.cards as Array<{ title: string; icon?: string }> | undefined ?? [];
      const icons: CarouselIcon[] = cards.map((c, i) => ({
        id: `icon-${i}`,
        label: c.title,
        // Use the emoji directly if it's a real emoji, otherwise use a pin fallback
        emoji: c.icon ?? "📌",
      }));
      const framesPerItem = Math.floor(durationFrames / Math.max(1, icons.length));

      return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          <BackgroundImage overlayOpacity={0.6} imageOpacity={1} />
          <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
            <IconCarousel
              icons={icons}
              framesPerItem={framesPerItem}
              theme={theme}
            />
          </div>
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
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          <BackgroundImage overlayOpacity={0.6} imageOpacity={1} />
          <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
            <Timeline
              events={events}
              theme={theme}
            />
          </div>
        </AbsoluteFill>
      );
    }

    case "checklist": {
      const checklistTitle = scene.content?.title as string | undefined;
      const itemsRaw = (scene.content?.items as string[] | undefined) ?? [];
      const items = itemsRaw.map((label, i) => ({
        label,
        revealAtFrame: 10 + (i * 20),
      }));

      return (
        <AbsoluteFill style={{ backgroundColor: "#000", padding: 100, justifyContent: "center" }}>
          <BackgroundImage overlayOpacity={0.6} imageOpacity={1} />
          <div style={{ position: "relative", zIndex: 1 }}>
            {checklistTitle && (
              <h2 style={{
                color: "white",
                fontFamily: theme.typography.styleA.family,
                marginBottom: 40,
                fontSize: 56,
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              }}>
                {checklistTitle}
              </h2>
            )}
            <Checklist
              items={items}
              theme={theme}
            />
          </div>
        </AbsoluteFill>
      );
    }

    case "image-fullscreen": {
      const caption = scene.content?.caption as string | undefined;
      return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          {imageSrc && (
            <Img
              src={imageSrc}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${imageScale})`,
                transformOrigin: "center center",
              }}
            />
          )}
          {/* Subtle gradient at the bottom for the caption */}
          {caption && (
            <AbsoluteFill
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)",
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
                padding: "20px 40px",
                borderRadius: 20,
                position: "relative",
                zIndex: 1,
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
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          <BackgroundImage overlayOpacity={0.3} imageOpacity={1} />
          <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
            <StudioMonitorLayout
              src={getImageUrl(studioImage as string) ?? ""}
              {...(rest as Record<string, unknown>)}
            />
          </div>
        </AbsoluteFill>
      );
    }

    default:
      return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
          <BackgroundImage overlayOpacity={0.55} imageOpacity={1} />
          <h1 style={{
            color: theme.colors.text,
            fontFamily: theme.typography.styleA.family,
            position: "relative",
            zIndex: 1,
          }}>
            Scene: {scene.id} ({scene.type})
          </h1>
        </AbsoluteFill>
      );
    }
  };

  // Alternate transitions
  const Transition = sceneIndex === 0 || scene.type === "title"
    ? SceneFade
    : sceneIndex % 2 === 0
      ? SceneFade
      : SceneSlideUp;

  return (
    <HandheldShake intensity={theme.vfx?.handheldIntensity ?? 0.02}>
      <Transition totalFrames={durationFrames}>
        {renderScene()}
      </Transition>
    </HandheldShake>
  );
};
