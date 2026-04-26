import express from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const renderRouter = express.Router();

// POST /api/render
renderRouter.post("/", (req, res) => {
  const { videoId } = req.body as { videoId: string };
  const outputDir = path.join(process.cwd(), "..", "videos", videoId);
  const outputFile = path.join(outputDir, `${videoId}.mp4`);
  const projectRoot = path.join(process.cwd(), "..");

  // Verifica se o script.json existe
  const scriptPath = path.join(outputDir, "script.json");
  if (!fs.existsSync(scriptPath)) {
    res.status(404).json({ error: "Script não encontrado para este vídeo" });
    return;
  }

  // Configura SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (event: string, data: object) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send("progress", { label: `Renderizando ${videoId}...` });

  // O compositionId é "DynamicVideo" (única composição registrada no Root.tsx)
  const tempPropsPath = path.join(outputDir, "temp-props.json");
  fs.writeFileSync(tempPropsPath, JSON.stringify({ videoId }));

  // Usa caminho relativo para evitar problemas de escape no Windows
  const relativePropsPath = path.join("videos", videoId, "temp-props.json");

  const stderrLines: string[] = [];

  // No Windows, npx precisa ser chamado via shell ou npx.cmd
  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "npx.cmd" : "npx";

  const child = spawn(cmd, [
    "remotion", "render", "DynamicVideo", outputFile, "--props", relativePropsPath
  ], { cwd: projectRoot });

  console.log(`[render] Iniciando: videoId=${videoId}, output=${outputFile}`);

  child.stdout?.on("data", (data: Buffer) => {
    // Extrai percentual do output do Remotion
    const text = data.toString();
    const match = text.match(/(\d+)%/);
    if (match) send("progress", { label: `Renderizando...`, percent: parseInt(match[1]) });
  });

  child.stderr?.on("data", (data: Buffer) => {
    // Remotion output progress info em stderr
    const text = data.toString();
    const match = text.match(/(\d+)%/);
    if (match) send("progress", { label: `Renderizando...`, percent: parseInt(match[1]) });
    stderrLines.push(text.trim());
    send("log", { message: text.trim() });
    process.stderr.write(`[render] ${text}`);
  });

  child.on("close", (code) => {
    // Remove o arquivo temporário de props
    if (fs.existsSync(tempPropsPath)) {
      try { fs.unlinkSync(tempPropsPath); } catch {}
    }
    console.log(`[render] Processo encerrado com código ${code}`);
    if (code === 0) {
      send("done", { outputFile: `videos/${videoId}/${videoId}.mp4` });
    } else {
      const errorSummary = stderrLines
        .filter((l) => l.toLowerCase().includes("error") || l.toLowerCase().includes("failed") || l.toLowerCase().includes("cannot"))
        .slice(-5)
        .join(" | ") || `Render falhou com código ${code}`;
      console.error(`[render] ERRO: ${errorSummary}`);
      send("error", { message: errorSummary });
    }
    res.end();
  });
});
