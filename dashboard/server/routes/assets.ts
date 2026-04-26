import express from "express";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import type { VideoScript, Scene } from "../../../src/types/scene.types";

export const assetsRouter = express.Router();

const getVideoDir = (videoId: string) =>
  path.join(process.cwd(), "..", "videos", videoId);

// GET /api/assets/:videoId/images — Lista imagens existentes
assetsRouter.get("/:videoId/images", (req, res) => {
  const { videoId } = req.params;
  const imagesDir = path.join(getVideoDir(videoId), "assets", "images");

  if (!fs.existsSync(imagesDir)) return res.json([]);

  const files = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map((f) => ({
      filename: f,
      url: `/videos/${videoId}/assets/images/${f}`,
      size: fs.statSync(path.join(imagesDir, f)).size,
    }));

  res.json(files);
});

// DELETE /api/assets/:videoId/images/:filename — Remove uma imagem
assetsRouter.delete("/:videoId/images/:filename", (req, res) => {
  const { videoId, filename } = req.params;
  const filePath = path.join(getVideoDir(videoId), "assets", "images", filename);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Imagem não encontrada" });

  try {
    fs.unlinkSync(filePath);
    res.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    res.status(500).json({ error: message });
  }
});

// POST /api/assets/:videoId/fetch-images — Busca imagens do Unsplash para cenas que possuem imageQuery
assetsRouter.post("/:videoId/fetch-images", async (req, res) => {
  const { videoId } = req.params;
  const videoDir = getVideoDir(videoId);
  const scriptPath = path.join(videoDir, "script.json");

  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ error: "Script não encontrado" });
  }

  // Configura SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (event: string, data: object) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8")) as VideoScript;
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
    const PEXELS_KEY = process.env.PEXELS_API_KEY;
    if (!UNSPLASH_KEY && !PEXELS_KEY) {
      send("error", { message: "Nenhuma API de imagem configurada (.env) (Unsplash ou Pexels)" });
      res.end();
      return;
    }

    const format = script.format ?? "16:9";
    const imagesDir = path.join(videoDir, "assets", "images");
    fs.mkdirSync(imagesDir, { recursive: true });

    // Encontra cenas com imageQuery (suporta content, props ou raiz)
    const scenesWithQuery = (script.scenes ?? [])
      .map((s: Scene, index: number) => {
        const props = (s as unknown as Record<string, Record<string, unknown>>).props ?? {};
        const root = s as unknown as Record<string, unknown>;
        const sceneId = s.id ?? `scene-${String(index + 1).padStart(2, "0")}`;
        const query = (s.content?.imageQuery as string | undefined) || (props.imageQuery as string | undefined) || (root.imageQuery as string | undefined);
        // Usa o mesmo padrão de nome de arquivo que o DynamicVideo (id.jpg)
        const imageFile = (s.content?.imageFile as string | undefined) || (props.imageFile as string | undefined) || (root.imageFile as string | undefined) || (query ? `${sceneId}.jpg` : undefined);
        return { index, id: sceneId, query, imageFile };
      })
      .filter((s) => s.query);

    if (scenesWithQuery.length === 0) {
      send("done", { message: "Nenhuma cena com imageQuery encontrada", fetched: 0 });
      res.end();
      return;
    }

    send("progress", { label: `Buscando ${scenesWithQuery.length} imagens...`, total: scenesWithQuery.length });

    let fetched = 0;

    for (let i = 0; i < scenesWithQuery.length; i++) {
      const scene = scenesWithQuery[i];
      const filename = scene.imageFile ?? `${scene.id}.jpg`;
      const imgPath = path.join(imagesDir, filename);

      if (fs.existsSync(imgPath)) {
        send("progress", {
          label: `⏭️ ${filename} já existe`,
          current: i + 1,
          total: scenesWithQuery.length,
        });
        fetched++;
        continue;
      }

      send("progress", {
        label: `🔍 Buscando: "${scene.query}"`,
        current: i + 1,
        total: scenesWithQuery.length,
      });

      try {
        let imgUrl = "";
        const orientation = format === "16:9" ? "landscape" : "portrait";

        // 1. Tenta Unsplash
        if (UNSPLASH_KEY) {
          try {
            const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              scene.query as string
            )}&per_page=1&orientation=${orientation}`;

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
            console.error("[Unsplash] Erro na busca manual:", e);
          }
        }

        // 2. Tenta Pexels se Unsplash falhou ou não existe
        if (!imgUrl && PEXELS_KEY) {
          try {
            const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
              scene.query as string
            )}&per_page=1&orientation=${orientation}`;

            const searchRes = await fetch(searchUrl, {
              headers: { Authorization: PEXELS_KEY },
            });
            
            interface PexelsResponse {
              photos: Array<{ src: { large2x: string; original: string } }>;
            }
            const searchData = (await searchRes.json()) as PexelsResponse;

            if (searchData.photos?.length) {
              imgUrl = searchData.photos[0].src.large2x || searchData.photos[0].src.original;
            }
          } catch (e) {
            console.error("[Pexels] Erro na busca manual:", e);
          }
        }

        if (imgUrl) {
          const imgRes = await fetch(imgUrl);
          const buffer = await imgRes.arrayBuffer();
          fs.writeFileSync(imgPath, Buffer.from(buffer));

          const sceneInScript = script.scenes[scene.index] as unknown as Record<string, Record<string, unknown>>;
          if (sceneInScript.content) {
            sceneInScript.content.imageFile = filename;
          } else if (sceneInScript.props) {
            sceneInScript.props.imageFile = filename;
          } else {
            (sceneInScript as unknown as Record<string, unknown>).imageFile = filename;
          }

          fetched++;
          send("progress", {
            label: `✅ ${filename} baixada`,
            current: i + 1,
            total: scenesWithQuery.length,
          });
        } else {
          send("progress", {
            label: `❌ Sem resultados para "${scene.query}"`,
            current: i + 1,
            total: scenesWithQuery.length,
          });
          send("warning", { message: `Nenhum resultado para "${scene.query}"` });
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        send("warning", { message: `Erro ao buscar "${scene.query}": ${message}` });
      }
    }

    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));
    send("done", { message: `${fetched} imagens baixadas`, fetched });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao buscar imagens";
    send("error", { message });
  } finally {
    res.end();
  }
});
