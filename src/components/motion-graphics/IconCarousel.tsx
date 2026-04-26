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

// Importa dinamicamente o ícone correto da biblioteca correta
const DynamicIcon: React.FC<{
  icon: CarouselIcon;
  size: number;
  color: string;
}> = ({ icon, size, color }) => {
  const IconComponent = React.useMemo(() => {
    // Se houver emoji, não precisamos de componente de ícone
    if (icon.emoji || !icon.iconName || !icon.iconLibrary) return undefined;
    
    return ICON_LIBS[icon.iconLibrary]?.[icon.iconName];
  }, [icon.iconName, icon.iconLibrary, icon.emoji]);

  // Retornos de renderização SEMPRE após todos os hooks
  if (icon.emoji) {
    return <span style={{ fontSize: size * 0.4, color }}>{icon.emoji}</span>;
  }

  if (!IconComponent) {
    return <span style={{ fontSize: size * 0.4, color }}>?</span>;
  }

  return <IconComponent size={size * 0.5} color={color} />;
};

export interface IconCarouselProps {
  icons: CarouselIcon[];
  theme: ChannelTheme;
  framesPerItem?: number;
  iconSize?: number;
  gap?: number;
}

export const IconCarousel: React.FC<IconCarouselProps> = ({
  icons,
  theme,
  framesPerItem = 80,
  iconSize = 200,
  gap = 40,
}) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const itemWidth = iconSize + gap;

  // Índice ativo atual para estilização
  const activeIndex = Math.min(Math.floor(frame / framesPerItem), icons.length - 1);

  // Animação suave entre os itens
  let animatedIndex = 0;
  for (let i = 1; i < icons.length; i++) {
    animatedIndex += spring({
      fps,
      frame: frame - i * framesPerItem,
      config: { damping: 14, stiffness: 100 },
    });
  }

  const offset = -animatedIndex * itemWidth + width / 2 - iconSize / 2;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        transform: `translateX(${offset}px)`,
        gap,
        position: "absolute",
      }}>
        {icons.map((icon, i) => {
          const isActive = i === activeIndex;
          const scale = isActive ? 1.1 : 0.9;
          const opacity = isActive ? 1 : 0.5;

          return (
            <div key={icon.id} style={{
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize * 0.2,
              backgroundColor: isActive ? `${theme.colors.accent}22` : theme.colors.surface,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background-color 0.3s, border 0.3s, transform 0.3s, opacity 0.3s",
              border: isActive ? `4px solid ${theme.colors.accent}` : `2px solid ${theme.colors.surface}`,
              flexShrink: 0,
              transform: `scale(${scale})`,
              opacity,
            }}>
              <DynamicIcon
                icon={icon}
                size={iconSize}
                color={isActive ? theme.colors.accent : theme.colors.textMuted}
              />
              <span
                style={{
                  fontFamily: theme.typography.styleB.family,
                  fontSize: 24,
                  color: isActive ? theme.colors.text : theme.colors.textMuted,
                  textAlign: "center",
                  maxWidth: iconSize - 16,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
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
