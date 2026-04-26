import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";
import type { CarouselIcon } from "../../types/scene.types";

// Importações oficiais (ESM) para evitar require()
import * as Fi from "react-icons/fi";
import * as Md from "react-icons/md";
import * as Fa from "react-icons/fa";
import * as Bs from "react-icons/bs";
import * as Hi from "react-icons/hi";
import * as Io5 from "react-icons/io5";
import * as Ri from "react-icons/ri";
import * as Si from "react-icons/si";

// Mapeamento das bibliotecas de ícones
const ICON_LIBS: Record<string, Record<string, React.ComponentType<{ size: number; color: string }>>> = {
  fi: Fi as unknown as Record<string, React.ComponentType<{ size: number; color: string }>>,
  md: Md as unknown as Record<string, React.ComponentType<{ size: number; color: string }>>,
  fa: Fa as unknown as Record<string, React.ComponentType<{ size: number; color: string }>>,
  bs: Bs as unknown as Record<string, React.ComponentType<{ size: number; color: string }>>,
  hi: Hi as unknown as Record<string, React.ComponentType<{ size: number; color: string }>>,
  io5: Io5 as unknown as Record<string, React.ComponentType<{ size: number; color: string }>>,
  ri: Ri as unknown as Record<string, React.ComponentType<{ size: number; color: string }>>,
  si: Si as unknown as Record<string, React.ComponentType<{ size: number; color: string }>>,
};

const DynamicIcon: React.FC<{
  icon: CarouselIcon;
  size: number;
  color: string;
}> = ({ icon, size, color }) => {
  const IconComponent = React.useMemo(() => {
    if (icon.emoji || !icon.iconName || !icon.iconLibrary) return undefined;
    return ICON_LIBS[icon.iconLibrary]?.[icon.iconName];
  }, [icon.iconName, icon.iconLibrary, icon.emoji]);

  if (icon.emoji) {
    return <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{icon.emoji}</span>;
  }
  if (!IconComponent) {
    return <span style={{ fontSize: size * 0.4, color }}>📌</span>;
  }
  return <IconComponent size={size * 0.5} color={color} />;
};

export interface IconCarouselProps {
  icons: CarouselIcon[];
  theme: ChannelTheme;
  framesPerItem?: number;
  iconSize?: number;
}

export const IconCarousel: React.FC<IconCarouselProps> = ({
  icons,
  theme,
  framesPerItem = 80,
  iconSize = 180,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Índice ativo avança a cada framesPerItem frames
  const activeIndex = Math.min(Math.floor(frame / framesPerItem), icons.length - 1);

  // Spring de entrada para o card ativo (escala)
  const activeScale = spring({
    fps,
    frame: frame - activeIndex * framesPerItem,
    config: { damping: 16, stiffness: 120, mass: 0.8 },
    from: 0.85,
    to: 1,
  });

  // Quantos por linha — max 4
  const cols = Math.min(icons.length, 4);
  const gap = 32;
  const cardSize = Math.min(iconSize, Math.floor(880 / cols) - gap);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cardSize}px)`,
          gap,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icons.map((icon, i) => {
          const isActive = i === activeIndex;
          // Cards anteriores ao ativo aparecem com fade-in na sua revelação
          const hasBeenRevealed = i <= activeIndex;
          const revealProgress = spring({
            fps,
            frame: frame - i * framesPerItem,
            config: { damping: 18, stiffness: 100 },
          });

          return (
            <div
              key={icon.id}
              style={{
                width: cardSize,
                height: cardSize,
                borderRadius: cardSize * 0.18,
                backgroundColor: isActive
                  ? `${theme.colors.accent}22`
                  : `${theme.colors.surface}cc`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                border: isActive
                  ? `4px solid ${theme.colors.accent}`
                  : `2px solid ${theme.colors.surface}`,
                flexShrink: 0,
                opacity: hasBeenRevealed ? revealProgress : 0,
                transform: `scale(${isActive ? activeScale : hasBeenRevealed ? 0.92 : 0.8})`,
                boxShadow: isActive
                  ? `0 8px 40px ${theme.colors.accent}44`
                  : "none",
              }}
            >
              <DynamicIcon
                icon={icon}
                size={cardSize}
                color={isActive ? theme.colors.accent : theme.colors.textMuted}
              />
              <span
                style={{
                  fontFamily: theme.typography.styleB.family,
                  fontSize: Math.max(18, cardSize * 0.13),
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? theme.colors.text : theme.colors.textMuted,
                  textAlign: "center",
                  maxWidth: cardSize - 20,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textShadow: isActive ? "0 2px 8px rgba(0,0,0,0.6)" : "none",
                }}
              >
                {icon.label}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
