import express from "express";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";

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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
    const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

    if (!UNSPLASH_KEY) {
      send("error", { message: "UNSPLASH_ACCESS_KEY não configurada no .env" });
      res.end();
      return;
    }

    const format = script.format ?? "16:9";
    const imagesDir = path.join(videoDir, "assets", "images");
    fs.mkdirSync(imagesDir, { recursive: true });

    // Encontra cenas com imageQuery (pode estar no nível raiz ou dentro de content)
    const scenesWithQuery = (script.scenes ?? [])
      .map((s: any, index: number) => ({
        index,
        id: s.id ?? `scene-${String(index + 1).padStart(2, "0")}`,
        query: s.imageQuery || s.content?.imageQuery || s.props?.imageQuery,
        imageFile: s.imageFile || s.content?.imageFile || s.props?.imageFile,
      }))
      .filter((s: any) => s.query);

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

      // Pula se a imagem já existe
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
        const orientation = format === "16:9" ? "landscape" : "portrait";
        const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          scene.query
        )}&per_page=1&orientation=${orientation}`;

        const searchRes = await fetch(searchUrl, {
          headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
        });
        const searchData = (await searchRes.json()) as any;

        if (searchData.results?.length) {
          const imgUrl = searchData.results[0].urls.regular;
          const imgRes = await fetch(imgUrl);
          const buffer = await imgRes.arrayBuffer();
          fs.writeFileSync(imgPath, Buffer.from(buffer));

          // Atualiza o imageFile no script (suporta content, props ou raiz)
          const sceneInScript = script.scenes[scene.index];
          if (sceneInScript.content) {
            sceneInScript.content.imageFile = filename;
          } else if (sceneInScript.props) {
            sceneInScript.props.imageFile = filename;
          } else {
            sceneInScript.imageFile = filename;
          }

          fetched++;
          send("progress", {
            label: `✅ ${filename} baixada`,
            current: i + 1,
            total: scenesWithQuery.length,
          });
        } else {
          send("warning", { message: `Nenhum resultado para "${scene.query}"` });
        }
      } catch (e: any) {
        send("warning", { message: `Erro ao buscar "${scene.query}": ${e.message}` });
      }
    }

    // Salva script com imageFile atualizado
    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));

    send("done", { message: `${fetched} imagens baixadas`, fetched });
  } catch (err: any) {
    send("error", { message: err.message ?? "Erro ao buscar imagens" });
  } finally {
    res.end();
  }
});
