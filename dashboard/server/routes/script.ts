import express from "express";
import path from "path";
import fs from "fs";

export const scriptRouter = express.Router();

const getVideoDir = (videoId: string) =>
  path.join(process.cwd(), "..", "videos", videoId);

const getScriptPath = (videoId: string) =>
  path.join(getVideoDir(videoId), "script.json");

// GET /api/script/:videoId
scriptRouter.get("/:videoId", (req, res) => {
  const { videoId } = req.params;
  const filePath = getScriptPath(videoId);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Script não encontrado" });
  res.json(JSON.parse(fs.readFileSync(filePath, "utf-8")));
});

// PUT /api/script/:videoId — salva edições do usuário
scriptRouter.put("/:videoId", (req, res) => {
  const { videoId } = req.params;
  const filePath = getScriptPath(videoId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/script — lista todos os vídeos existentes com metadados
scriptRouter.get("/", (_req, res) => {
  const videosDir = path.join(process.cwd(), "..", "videos");
  if (!fs.existsSync(videosDir)) return res.json([]);

  const dirs = fs
    .readdirSync(videosDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => {
      const videoDir = path.join(videosDir, d.name);
      const scriptPath = path.join(videoDir, "script.json");
      const hasScript = fs.existsSync(scriptPath);

      let meta: Record<string, unknown> = {
        videoId: d.name,
        title: d.name,
        hasScript,
        sceneCount: 0,
        format: "16:9",
        channelId: "channel-default",
        hasNarration: false,
        hasImages: false,
        hasRender: false,
      };

      if (hasScript) {
        try {
          const s = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
          const titleScene = s.scenes?.find((sc: any) => sc.type === "title");
          const title = titleScene?.content?.title ?? titleScene?.title ?? d.name;

          // Conta narrações
          const narrationDir = path.join(videoDir, "narration");
          const narrationFiles = fs.existsSync(narrationDir)
            ? fs.readdirSync(narrationDir).filter((f: string) => f.endsWith(".mp3") || f.endsWith(".wav"))
            : [];

          // Conta imagens
          const imagesDir = path.join(videoDir, "assets", "images");
          const imageFiles = fs.existsSync(imagesDir)
            ? fs.readdirSync(imagesDir).filter((f: string) => /\.(jpg|jpeg|png|webp)$/i.test(f))
            : [];

          // Verifica se existe render
          const hasRender = fs.existsSync(path.join(videoDir, `${d.name}.mp4`));

          // Conta cenas com imageQuery
          const scenesWithImages = (s.scenes ?? []).filter(
            (sc: any) => sc.imageQuery || sc.content?.imageQuery
          );

          meta = {
            videoId: d.name,
            title,
            hasScript,
            sceneCount: s.scenes?.length ?? 0,
            format: s.format ?? "16:9",
            channelId: s.channelId ?? "channel-default",
            hasNarration: narrationFiles.length > 0,
            narrationCount: narrationFiles.length,
            hasImages: imageFiles.length > 0,
            imageCount: imageFiles.length,
            imageQueryCount: scenesWithImages.length,
            hasRender,
          };
        } catch {}
      }

      return meta;
    })
    // Ordena por nome (mais recentes primeiro, pois o ID é timestamp)
    .sort((a, b) => String(b.videoId).localeCompare(String(a.videoId)));

  res.json(dirs);
});
