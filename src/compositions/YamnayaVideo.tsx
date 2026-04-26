import React from "react";
import { AbsoluteFill, Sequence, Img, staticFile, interpolate, useCurrentFrame, useVideoConfig, Html5Audio } from "remotion";
import { AnimatedTitle, DocumentaryLayout, ProgressiveHighlight, IconCarousel, Timeline, Checklist } from "../components";
import { getTheme } from "../themes";

const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <div style={{ opacity, width: "100%", height: "100%", position: "absolute" }}>{children}</div>;
};

// IconCarousel agora lida com o timing internamente.

export const YamnayaVideo: React.FC = () => {
  const theme = getTheme("channel-history");
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background, color: "white", fontFamily: "system-ui, sans-serif" }}>
      
      {/* Cena 1: Title (10s) */}
      <Sequence durationInFrames={300} name="Scene 1 - Title">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-01.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <AnimatedTitle
              text="Os Yamnaya: O Povo que Reescreveu a Nossa História"
              theme={theme}
              style="A"
              delayBetweenLetters={2}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 2: Documentary Layout (8s) */}
      <Sequence from={300} durationInFrames={240} name="Scene 2 - Túmulos">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-02.mp3")} />
        <Fade>
          <DocumentaryLayout
            theme={theme}
            imageSrc={staticFile("videos/video-1777134303107/assets/images/scene-02.jpg")}
            title="4.500 anos"
            subtitle="Sepulturas antigas nas pradarias"
          />
        </Fade>
      </Sequence>

      {/* Cena 3: Text Highlight (9s) */}
      <Sequence from={540} durationInFrames={270} name="Scene 3 - Cultura Marginal">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-03.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <ProgressiveHighlight
              text="Por grande parte do século 20, os livros de história os chamaram de uma cultura marginal."
              theme={theme}
              startFrame={30}
              endFrame={150}
              showDarkOverlay={false}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 4: Text Highlight (7s) */}
      <Sequence from={810} durationInFrames={210} name="Scene 4 - Sementes">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-04.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <ProgressiveHighlight
              text="Acreditava-se que as línguas se haviam espalhado pacificamente, levadas por sementes, não por cavaleiros."
              theme={theme}
              startFrame={30}
              endFrame={120}
              showDarkOverlay={false}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 5: Image Fullscreen (9s) */}
      <Sequence from={1020} durationInFrames={270} name="Scene 5 - DNA Antigo">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-05.mp3")} />
        <Fade>
          <DocumentaryLayout
            theme={theme}
            imageSrc={staticFile("videos/video-1777134303107/assets/images/scene-05.jpg")}
            title="DNA antigo reescreve o passado"
          />
        </Fade>
      </Sequence>

      {/* Cena 6: Documentary Layout (10s) */}
      <Sequence from={1290} durationInFrames={300} name="Scene 6 - Quase Metade">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-06.mp3")} />
        <Fade>
          <DocumentaryLayout
            theme={theme}
            imageSrc={staticFile("videos/video-1777134303107/assets/images/scene-06.jpg")}
            title="Quase metade do mundo"
            subtitle="DNA antigo confirma impacto genético"
          />
        </Fade>
      </Sequence>

      {/* Cena 7: Icon Carousel (8s) */}
      <Sequence from={1590} durationInFrames={240} name="Scene 7 - Expansão Oest">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-07.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <Img src={staticFile("videos/video-1777134303107/assets/images/scene-07.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, position: "absolute" }} />
            <IconCarousel 
              theme={theme} 
              framesPerItem={80}
              icons={[
                { id: "1", label: "DNA moderno", iconName: "FiDatabase", iconLibrary: "fi" },
                { id: "2", label: "Expansão rápida", iconName: "FiArrowRight", iconLibrary: "fi" },
                { id: "3", label: "5.000 anos", iconName: "FiClock", iconLibrary: "fi" }
              ]} 
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 8: Timeline (8s) */}
      <Sequence from={1830} durationInFrames={240} name="Scene 8 - Grã-Bretanha">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-08.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <Timeline
              theme={theme}
              events={[
                { label: "5.000 anos atrás", revealFrame: 30 },
                { label: "Grã-Bretanha: 90% substituído", revealFrame: 100 },
                { label: "4.200 anos atrás", revealFrame: 170 }
              ]}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 9: Image Fullscreen (6s) */}
      <Sequence from={2070} durationInFrames={180} name="Scene 9 - Stonehenge">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-09.mp3")} />
        <Fade>
          <DocumentaryLayout
            theme={theme}
            imageSrc={staticFile("videos/video-1777134303107/assets/images/scene-09.jpg")}
            title="Mudança demográfica total"
          />
        </Fade>
      </Sequence>

      {/* Cena 10: Documentary Layout (10s) */}
      <Sequence from={2250} durationInFrames={300} name="Scene 10 - Reconstrução">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-10.mp3")} />
        <Fade>
          <DocumentaryLayout
            theme={theme}
            imageSrc={staticFile("videos/video-1777134303107/assets/images/scene-10.jpg")}
            title="Reconstrução em 3D"
            subtitle="Altura acima da média para a Idade do Bronze"
          />
        </Fade>
      </Sequence>

      {/* Cena 11: Checklist (9s) */}
      <Sequence from={2550} durationInFrames={270} name="Scene 11 - Altura">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-11.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background, justifyContent: "center", padding: 150 }}>
            <Checklist
              theme={theme}
              items={[
                { label: "Altura média: 1,77m", revealAtFrame: 30 },
                { label: "Dominância física", revealAtFrame: 90 },
                { label: "Vizinhos: raramente 1,60m", revealAtFrame: 150 },
                { label: "Maior porte na comparação", revealAtFrame: 210 }
              ]}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 12: Text Highlight (8s) */}
      <Sequence from={2820} durationInFrames={240} name="Scene 12 - A Grande Pergunta">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-12.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <ProgressiveHighlight
              text="A grande pergunta: como tão poucas pessoas dominaram uma paisagem genética tão vasta?"
              theme={theme}
              startFrame={30}
              endFrame={180}
              showDarkOverlay={false}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 13: Icon Carousel (10s) */}
      <Sequence from={3060} durationInFrames={300} name="Scene 13 - Mecanismos">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-13.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <Img src={staticFile("videos/video-1777134303107/assets/images/scene-13.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, position: "absolute" }} />
            <IconCarousel 
              theme={theme} 
              framesPerItem={75}
              icons={[
                { id: "1", label: "Mobilidade", iconName: "FiTruck", iconLibrary: "fi" },
                { id: "2", label: "Dieta", iconName: "FiCoffee", iconLibrary: "fi" },
                { id: "3", label: "Saúde", iconName: "FiHeart", iconLibrary: "fi" },
                { id: "4", label: "Violência", iconName: "FiCrosshair", iconLibrary: "fi" }
              ]} 
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 14: Text Highlight (8s) */}
      <Sequence from={3360} durationInFrames={240} name="Scene 14 - Mobilidade">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-14.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <ProgressiveHighlight
              text="Eles viviam sobre rodas e foram uma das primeiras culturas a montar cavalos."
              theme={theme}
              startFrame={30}
              endFrame={150}
              showDarkOverlay={false}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 15: Text Highlight (9s) */}
      <Sequence from={3600} durationInFrames={270} name="Scene 15 - Dieta">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-15.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <ProgressiveHighlight
              text="Consumiam laticínios graças a uma mutação genética rara que permitia digerir leite cru na vida adulta."
              theme={theme}
              startFrame={30}
              endFrame={180}
              showDarkOverlay={false}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 16: Text Highlight (7s) */}
      <Sequence from={3870} durationInFrames={210} name="Scene 16 - Saúde">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-16.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <ProgressiveHighlight
              text="O genoma deles era notavelmente limpo e resistente às doenças."
              theme={theme}
              startFrame={30}
              endFrame={120}
              showDarkOverlay={false}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 17: Image Fullscreen (10s) */}
      <Sequence from={4080} durationInFrames={300} name="Scene 17 - Violência">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-17.mp3")} />
        <Fade>
          <DocumentaryLayout
            theme={theme}
            imageSrc={staticFile("videos/video-1777134303107/assets/images/scene-17.jpg")}
            title="Uma força implacável"
            subtitle="Valas comuns evidenciam domínio sobre fazendeiros neolíticos"
          />
        </Fade>
      </Sequence>

      {/* Cena 18: Text Highlight (9s) */}
      <Sequence from={4380} durationInFrames={270} name="Scene 18 - Desaparecimento">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-18.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
            <ProgressiveHighlight
              text="Os Yamnaya desapareceram como um povo nomeado... mas eles nunca nos deixaram."
              theme={theme}
              startFrame={30}
              endFrame={180}
              showDarkOverlay={false}
            />
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 19: Documentary Layout (10s) */}
      <Sequence from={4650} durationInFrames={300} name="Scene 19 - Legado">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-19.mp3")} />
        <Fade>
          <AbsoluteFill style={{ backgroundColor: theme.colors.background, justifyContent: "center", padding: 150 }}>
            <Img src={staticFile("videos/video-1777134303107/assets/images/scene-19.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, position: "absolute", top: 0, left: 0 }} />
            <div style={{ zIndex: 1 }}>
              <h2 style={{ fontSize: 70, color: theme.colors.accent, marginBottom: 40, fontFamily: theme.typography.styleA.family }}>O Legado</h2>
              <Checklist
                theme={theme}
                items={[
                  { label: "Palavras: Línguas descendentes", revealAtFrame: 30 },
                  { label: "Famílias: Estruturas herdadas", revealAtFrame: 100 },
                  { label: "Genética: Linhas de sangue ativas", revealAtFrame: 170 }
                ]}
              />
            </div>
          </AbsoluteFill>
        </Fade>
      </Sequence>

      {/* Cena 20: Image Fullscreen (7s) */}
      <Sequence from={4950} durationInFrames={210} name="Scene 20 - Final">
        <Html5Audio src={staticFile("videos/video-1777134303107/narration/scene-20.mp3")} />
        <Fade>
          <DocumentaryLayout
            theme={theme}
            imageSrc={staticFile("videos/video-1777134303107/assets/images/scene-20.jpg")}
            title="Ainda somos eles."
          />
        </Fade>
      </Sequence>

    </AbsoluteFill>
  );
};
