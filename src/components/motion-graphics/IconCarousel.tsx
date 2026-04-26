import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { ChannelTheme } from "../../types/channel.types";
import type { CarouselIcon } from "../../types/scene.types";



// Importa dinamicamente o ícone correto da biblioteca correta
const DynamicIcon: React.FC<{ iconName: string; iconLibrary: string; size: number; color: string }> = ({
  iconName,
  iconLibrary,
  size,
  color,
}) => {
  const IconComponent = React.useMemo(() => {
    const libs: Record<string, Record<string, React.FC<{ size: number; color: string }>>> = {
      fi: require("react-icons/fi"),
      md: require("react-icons/md"),
      fa: require("react-icons/fa"),
      bs: require("react-icons/bs"),
      hi: require("react-icons/hi"),
      io5: require("react-icons/io5"),
      ri: require("react-icons/ri"),
      si: require("react-icons/si"),
    };
    return libs[iconLibrary]?.[iconName];
  }, [iconName, iconLibrary]);

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
                iconName={icon.iconName}
                iconLibrary={icon.iconLibrary}
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
