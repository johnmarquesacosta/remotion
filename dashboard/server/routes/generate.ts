import express from "express";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { generateScriptWithClaude } from "../services/claude";
import { generateAudioWithRetry, type TTSProvider } from "../services/tts";
import { getAudioDuration } from "../services/audio-duration";
import type { VideoScript } from "../../../src/types/scene.types";

export const generateRouter = express.Router();

interface GeneratePayload {
  title: string;
  narrativeText: string;
  channelId: string;
  format: "16:9" | "9:16";
  ttsProvider: TTSProvider;
  videoId?: string; // se não informado, gera automaticamente
}

generateRouter.post("/", async (req, res) => {
  // Configura SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (event: string, data: object) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const { title, narrativeText, channelId, format, ttsProvider, videoId: inputId } =
    req.body as GeneratePayload;

  // Gera ID único se não fornecido
  const videoId = inputId ?? `video-${Date.now()}`;
  const projectRoot = path.join(process.cwd(), "..");
  const videoDir = path.join(projectRoot, "videos", videoId);
  const narrationDir = path.join(videoDir, "narration");

  fs.mkdirSync(path.join(videoDir, "assets", "images"), { recursive: true });
  fs.mkdirSync(path.join(videoDir, "assets", "sfx"), { recursive: true });
  fs.mkdirSync(narrationDir, { recursive: true });

  try {
    // ── PASSO 1: Claude gera script.json ──────────────────────────────────
    send("progress", { step: 1, total: 4, label: "Gerando roteiro com Claude...", videoId });

    const script = await generateScriptWithClaude({
      videoId,
      channelId,
      format,
      title,
      narrativeText,
    });

    // Salva versão inicial (sem durações reais de áudio ainda)
    const scriptPath = path.join(videoDir, "script.json");
    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));

    send("progress", { step: 1, total: 4, label: `Roteiro gerado: ${script.scenes.length} cenas`, done: true });

    // ── PASSO 2: TTS — gera áudio por cena ────────────────────────────────
    send("progress", { step: 2, total: 4, label: "Gerando narração (TTS)..." });

    const scenesWithNarration = script.scenes.filter(
      (s) => s.narration?.text && s.narration?.file
    );

    for (let i = 0; i < scenesWithNarration.length; i++) {
      const scene = scenesWithNarration[i];
      const audioPath = path.join(narrationDir, scene.narration!.file!);

      send("progress", {
        step: 2,
        total: 4,
        label: `TTS: cena ${i + 1}/${scenesWithNarration.length} — ${scene.id}`,
        subProgress: (i / scenesWithNarration.length) * 100,
      });

      await generateAudioWithRetry(
        scene.narration!.text!,
        audioPath,
        ttsProvider,
        3,
        (attempt, err) => {
          send("warning", {
            message: `TTS cena ${scene.id}: tentativa ${attempt} falhou (${err.message}). Tentando novamente...`,
          });
        }
      );

      // Mede duração real e atualiza no script
      const duration = await getAudioDuration(audioPath);
      const sceneIndex = script.scenes.findIndex((s) => s.id === scene.id);
      if (sceneIndex !== -1) {
        // Adiciona 0.5s de padding ao final
        script.scenes[sceneIndex].durationInSeconds = Math.ceil(duration + 0.5);
      }
    }

    // Salva script.json atualizado com durações reais
    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));

    send("progress", { step: 2, total: 4, label: "Narração gerada com durações reais", done: true });

    // ── PASSO 3: Assets (imagens) ──────────────────────────────────────────
    send("progress", { step: 3, total: 4, label: "Buscando imagens..." });

    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
    const PEXELS_KEY = process.env.PEXELS_API_KEY;
    const scenesWithImages = script.scenes.filter((s) => s.content?.imageQuery);

    if ((UNSPLASH_KEY || PEXELS_KEY) && scenesWithImages.length > 0) {
      for (let i = 0; i < scenesWithImages.length; i++) {
        const scene = scenesWithImages[i];
        const query = scene.content.imageQuery as string;
        const filename = (scene.content.imageFile as string | undefined) || `${scene.id}.jpg`;

        send("progress", {
          step: 3,
          total: 4,
          label: `Imagem ${i + 1}/${scenesWithImages.length}: "${query}"`,
        });

        try {
          let imgUrl = "";
          const orientation = format === "16:9" ? "landscape" : "portrait";

          // 1. Tenta Unsplash
          if (UNSPLASH_KEY) {
            try {
              const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`;
              const searchRes = await fetch(searchUrl, {
                headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
              });

              interface UnsplashResponse {
                results: Array<{ urls: { regular: string } }>;
              }
              const searchData = (await searchRes.json()) as UnsplashResponse;
              if (searchData.results?.length) {
                imgUrl = searchData.results[0].urls.regular;
              }
            } catch (e) {
              console.error("[Unsplash] Erro ao buscar:", e);
            }
          }

          // 2. Tenta Pexels como fallback se Unsplash falhou ou não está configurado
          if (!imgUrl && PEXELS_KEY) {
            try {
              const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`;
              const searchRes = await fetch(searchUrl, {
                headers: { Authorization: PEXELS_KEY },
              });
              
              interface PexelsResponse {
                photos: Array<{ src: { large2x: string; original: string } }>;
              }
              const searchData = (await searchRes.json()) as PexelsResponse;
              if (searchData.photos?.length) {
                // Pexels retorna tamanhos variados. 'large2x' ou 'original' são bons para vídeos
                imgUrl = searchData.photos[0].src.large2x || searchData.photos[0].src.original;
              }
            } catch (e) {
              console.error("[Pexels] Erro ao buscar:", e);
            }
          }

          if (imgUrl) {
            const imgRes = await fetch(imgUrl);
            const buffer = await imgRes.arrayBuffer();
            const imgPath = path.join(videoDir, "assets", "images", filename);
            fs.writeFileSync(imgPath, Buffer.from(buffer));

            // Atualiza o imageFile no script
            const sceneIndex = script.scenes.findIndex((s) => s.id === scene.id);
            if (sceneIndex !== -1) {
              script.scenes[sceneIndex].content.imageFile = filename;
            }
          } else {
            send("warning", { message: `Sem resultados no Unsplash/Pexels para: "${query}"` });
          }
        } catch {
          send("warning", { message: `Falha na requisição de imagem para "${query}"` });
        }
      }

      fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));
    } else if (!UNSPLASH_KEY && !PEXELS_KEY) {
      send("warning", { message: "Nenhuma API de imagem configurada (.env) — imagens puladas" });
    }

    send("progress", { step: 3, total: 4, label: "Assets prontos", done: true });

    // ── PASSO 4: Finalizado ────────────────────────────────────────────────
    send("progress", { step: 4, total: 4, label: "Pipeline completo!", done: true });
    send("done", { videoId, scriptPath: `videos/${videoId}/script.json`, script });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido no pipeline";
    send("error", { message });
  } finally {
    res.end();
  }
});

// ── RETRY TTS: re-gera áudio para cenas com falha ─────────────────────────
generateRouter.post("/retry-tts/:videoId", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (event: string, data: object) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const { videoId } = req.params;
  const { ttsProvider = "kokoro" } = req.body as { ttsProvider?: TTSProvider };

  const projectRoot = path.join(process.cwd(), "..");
  const videoDir = path.join(projectRoot, "videos", videoId);
  const scriptPath = path.join(videoDir, "script.json");
  const narrationDir = path.join(videoDir, "narration");

  try {
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`script.json não encontrado para o vídeo "${videoId}"`);
    }

    const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8")) as VideoScript;

    const scenesWithNarration = script.scenes.filter(
      (s) => s.narration?.text && s.narration?.file
    );

    // Filtra somente as cenas cujo arquivo de áudio está ausente
    const missingScenes = scenesWithNarration.filter((s) => {
      const audioPath = path.join(narrationDir, s.narration!.file!);
      return !fs.existsSync(audioPath);
    });

    if (missingScenes.length === 0) {
      send("done", { videoId, regenerated: 0, message: "Todos os áudios já existem. Nada a fazer." });
      res.end();
      return;
    }

    send("progress", {
      step: 1,
      total: 1,
      label: `Re-gerando TTS: ${missingScenes.length} cena(s) com áudio ausente...`,
    });

    let regenerated = 0;
    const errors: string[] = [];

    for (let i = 0; i < missingScenes.length; i++) {
      const scene = missingScenes[i];
      const audioPath = path.join(narrationDir, scene.narration!.file!);

      send("progress", {
        step: 1,
        total: 1,
        label: `TTS retry: cena ${i + 1}/${missingScenes.length} — ${scene.id}`,
        subProgress: (i / missingScenes.length) * 100,
      });

      try {
        await generateAudioWithRetry(
          scene.narration!.text!,
          audioPath,
          ttsProvider,
          3,
          (attempt, err) => {
            send("warning", {
              message: `Retry ${attempt}/3 para cena "${scene.id}": ${err.message}`,
            });
          }
        );

        // Atualiza duração real no script
        const duration = await getAudioDuration(audioPath);
        const sceneIndex = script.scenes.findIndex((s) => s.id === scene.id);
        if (sceneIndex !== -1) {
          script.scenes[sceneIndex].durationInSeconds = Math.ceil(duration + 0.5);
        }

        regenerated++;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const msg = `Cena "${scene.id}" falhou após 3 tentativas: ${errorMsg}`;
        errors.push(msg);
        send("warning", { message: msg });
      }
    }

    // Salva script atualizado com durações
    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));

    if (errors.length > 0) {
      send("done", {
        videoId,
        regenerated,
        failed: errors.length,
        message: `${regenerated} áudio(s) gerado(s), ${errors.length} ainda com falha.`,
        errors,
      });
    } else {
      send("done", {
        videoId,
        regenerated,
        failed: 0,
        message: `${regenerated} áudio(s) re-gerado(s) com sucesso!`,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido no retry TTS";
    send("error", { message });
  } finally {
    res.end();
  }
});
