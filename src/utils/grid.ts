// Retorna o ponto de origem (0-1 normalizado) para zoom baseado em quadrante
export type ZoomOriginName = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export const ZOOM_ORIGINS: Record<ZoomOriginName, { x: number; y: number }> = {
  "center":       { x: 0.5, y: 0.5 },
  "top-left":     { x: 0.25, y: 0.25 },
  "top-right":    { x: 0.75, y: 0.25 },
  "bottom-left":  { x: 0.25, y: 0.75 },
  "bottom-right": { x: 0.75, y: 0.75 },
};

export function getZoomOriginPx(
  origin: ZoomOriginName,
  width: number,
  height: number
): { x: number; y: number } {
  const o = ZOOM_ORIGINS[origin];
  return { x: o.x * width, y: o.y * height };
}
