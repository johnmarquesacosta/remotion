import React from "react";
import { AbsoluteFill, Img, useVideoConfig } from "remotion";
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
import { ZoomFromCenter } from "../components/camera/ZoomFromCenter";
import { SceneFade } from "../components/transitions/SceneFade";

interface SceneRendererProps {
  scene: any;
  channelId: string;
  videoId: string;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, channelId, videoId }) => {
  const theme = getTheme(channelId);
  const { fps } = useVideoConfig();
  
  // Helper to get image URL from the dashboard server
  const getImageUrl = (imageFile?: string) => {
    if (!imageFile) return undefined;
    return `http://localhost:3333/videos/${videoId}/assets/${imageFile}`;
  };

  const imageSrc = getImageUrl(scene.imageFile);
  const durationFrames = Math.round((scene.durationInSeconds || 5) * fps);

  // Common background image wrapper
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
          opacity: 0.4 
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
            text={scene.title || scene.content?.title || "Título do Vídeo"} 
            theme={theme} 
          />
        </AbsoluteFill>
      );
      
    case "documentary-layout": {
      const infoBox = (scene.layout?.infoBoxes || scene.content?.infoBoxes || [])[0];
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
      const cards = scene.cards || scene.content?.cards || [];
      const icons = cards.map((c: any, i: number) => ({
        id: `icon-${i}`,
        label: c.title,
        emoji: c.icon === "dna" ? "🧬" : c.icon === "arrow-west" ? "⬅️" : c.icon === "timeline-dot" ? "⏳" : "📌"
      }));
      // Ativa o índice com base no tempo da cena
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
      const markers = scene.timeline?.markers || scene.content?.markers || [];
      const events = markers.map((m: any, i: number) => ({
        label: m.value || m.label,
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
      const itemsRaw = scene.items || scene.content?.items || [];
      const items = itemsRaw.map((label: string, i: number) => ({
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
      
    case "image-fullscreen":
      return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          {imageSrc && <Img src={imageSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          {scene.caption && (
             <AbsoluteFill style={{ justifyContent: "flex-end", padding: "80px", alignItems: "center" }}>
               <h2 style={{ 
                 color: "white", 
                 fontSize: "60px", 
                 fontFamily: theme.typography.styleA.family,
                 textShadow: "0px 4px 20px rgba(0,0,0,0.9)",
                 textAlign: "center",
                 backgroundColor: "rgba(0,0,0,0.4)",
                 padding: "20px 40px",
                 borderRadius: 20
               }}>
                 {scene.caption}
               </h2>
             </AbsoluteFill>
          )}
        </AbsoluteFill>
      );

    case "studio-monitor": {
      const { imageSrc, ...rest } = scene.content || {};
      return (
        <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
          <StudioMonitorLayout
            src={getImageUrl(imageSrc as string) || ""}
            {...rest}
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

  return (
    <HandheldShake intensity={theme.vfx?.handheldIntensity ?? 0.02}>
      <ZoomFromCenter from={1} to={1.04} endFrame={durationFrames}>
        <SceneFade totalFrames={durationFrames}>
          {renderScene()}
        </SceneFade>
      </ZoomFromCenter>
    </HandheldShake>
  );
};
