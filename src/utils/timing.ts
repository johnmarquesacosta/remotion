export const sec = (s: number, fps: number) => Math.round(s * fps);
export const frame = (f: number, fps: number) => f / fps;

// Mapeia um range de frames para 0-1
export function frameRange(currentFrame: number, startFrame: number, endFrame: number): number {
  return Math.min(1, Math.max(0, (currentFrame - startFrame) / (endFrame - startFrame)));
}
