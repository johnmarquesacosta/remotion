export interface VideoAssets {
  videoId: string;
  basePath: string; // caminho para videos/{videoId}/
  images: Record<string, string>;    // chave → caminho da imagem
  sfx: Record<string, string>;       // chave → caminho do sfx
  narration: Record<string, string>; // chave → caminho do áudio
}
