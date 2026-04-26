import fs from "fs";
import path from "path";

const videoId = process.argv[2];
const ttsProvider = (process.argv[3] ?? "kokoro") as "kokoro" | "omnivoice";

if (!videoId) {
  console.error("Uso: npx tsx scripts/generate-narration.ts video-001 [kokoro|omnivoice]");
  process.exit(1);
}

const scriptPath = path.join(__dirname, `../videos/${videoId}/script.json`);
const narrationDir = path.join(__dirname, `../videos/${videoId}/narration`);

if (!fs.existsSync(scriptPath)) {
  console.error(`Script não encontrado: ${scriptPath}`);
  process.exit(1);
}

fs.mkdirSync(narrationDir, { recursive: true });

const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));

// Configurações dos providers TTS locais
const TTS_CONFIGS = {
  kokoro: {
    url: "http://localhost:8881/v1/audio/speech",
    buildBody: (text: string) => JSON.stringify({
      model: "kokoro",
      input: text,
      voice: "af_sky",        // Troque pela voz desejada
      response_format: "wav",
      speed: 1.0,
    }),
  },
  omnivoice: {
    url: "http://localhost:7860/api/tts",
    buildBody: (text: string) => JSON.stringify({
      text,
      speaker_id: 0,
      language: "pt",
    }),
  },
};

async function generateNarration(sceneId: string, text: string, outputFile: string) {
  const config = TTS_CONFIGS[ttsProvider];
  const outputPath = path.join(narrationDir, outputFile);

  console.log(`🎙️  Gerando narração para ${sceneId}: "${text.slice(0, 50)}..."`);

  const response = await fetch(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: config.buildBody(text),
  });

  if (!response.ok) {
    console.error(`❌ Erro na cena ${sceneId}: ${response.statusText}`);
    return;
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  console.log(`✅ Salvo em narration/${outputFile}`);
}

async function main() {
  for (const scene of script.scenes) {
    if (scene.narration?.text && scene.narration?.file) {
      await generateNarration(scene.id, scene.narration.text, scene.narration.file);
    }
  }
  console.log("\n🎉 Narração gerada com sucesso!");
}

main();
