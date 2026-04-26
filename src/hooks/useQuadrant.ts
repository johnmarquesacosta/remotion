import { useVideoConfig } from "remotion";

export type QuadrantPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

interface QuadrantInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

// Calcula a posição e dimensões de um quadrante na grade 2x2
export function useQuadrant(position: QuadrantPosition): QuadrantInfo {
  const { width, height } = useVideoConfig();
  const hw = width / 2;
  const hh = height / 2;

  const quadrants: Record<QuadrantPosition, QuadrantInfo> = {
    "top-left":     { x: 0,  y: 0,  width: hw, height: hh, centerX: hw/2,      centerY: hh/2 },
    "top-right":    { x: hw, y: 0,  width: hw, height: hh, centerX: hw + hw/2, centerY: hh/2 },
    "bottom-left":  { x: 0,  y: hh, width: hw, height: hh, centerX: hw/2,      centerY: hh + hh/2 },
    "bottom-right": { x: hw, y: hh, width: hw, height: hh, centerX: hw + hw/2, centerY: hh + hh/2 },
    "center":       { x: 0,  y: 0,  width,     height,     centerX: width/2,   centerY: height/2 },
  };

  return quadrants[position];
}
