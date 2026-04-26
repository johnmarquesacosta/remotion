import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const videoId = process.argv[2];
if (!videoId) {
  console.error("Forneça o videoId como argumento.");
  process.exit(1);
}

const scriptPath = path.resolve(`public/videos/${videoId}/script.json`);
if (!fs.existsSync(scriptPath)) {
  console.error("Script.json não encontrado em", scriptPath);
  process.exit(1);
}

const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));

for (const scene of script.scenes) {
  if (scene.narration?.file) {
    const audioPath = path.resolve(`public/videos/${videoId}/narration/${scene.narration.file}`);
    if (fs.existsSync(audioPath)) {
      try {
        // Usa ffprobe para obter duração real
        const output = execSync(
          `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`
        ).toString().trim();
        const duration = parseFloat(output);
        if (!isNaN(duration)) {
          scene.durationInSeconds = duration + 0.5; // +500ms de padding
          console.log(`✅ ${scene.id}: ${duration.toFixed(2)}s → ${scene.durationInSeconds.toFixed(2)}s`);
        }
      } catch (err) {
        console.error(`Erro ao obter duração de ${audioPath}:`, err);
      }
    } else {
      console.warn(`⚠️ Arquivo de áudio não encontrado: ${audioPath}`);
    }
  }
}

fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));
console.log("Durações atualizadas em", scriptPath);
