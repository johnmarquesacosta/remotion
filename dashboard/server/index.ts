import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { generateRouter } from "./routes/generate";
import { scriptRouter } from "./routes/script";
import { renderRouter } from "./routes/render";
import { assetsRouter } from "./routes/assets";

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/generate", generateRouter);
app.use("/api/script", scriptRouter);
app.use("/api/render", renderRouter);
app.use("/api/assets", assetsRouter);

// Serve arquivos estáticos dos vídeos (preview de imagens/áudio)
app.use("/videos", express.static(path.join(process.cwd(), "..", "videos")));

app.listen(PORT, () => {
  console.log(`\n🎬 Dashboard server rodando em http://localhost:${PORT}\n`);
});
