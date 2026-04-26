import fs from "fs";
import path from "path";

const videoId = process.argv[2];
if (!videoId) {
  console.error("Uso: npx tsx scripts/fetch-assets.ts video-001");
  process.exit(1);
}

const scriptPath = path.join(__dirname, `../videos/${videoId}/script.json`);
const imagesDir = path.join(__dirname, `../videos/${videoId}/assets/images`);

fs.mkdirSync(imagesDir, { recursive: true });

const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));

// Extrai todas as referências de imagens do script
// Procura por campos "imageSrc" ou "imageQuery" em qualquer cena
async function fetchImage(query: string, filename: string) {
  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (!UNSPLASH_KEY) {
    console.warn("⚠️  UNSPLASH_ACCESS_KEY não configurada. Pulando busca de imagem.");
    return;
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } });
  const data = await res.json() as any;

  if (!data.results?.length) {
    console.warn(`⚠️  Nenhuma imagem encontrada para: ${query}`);
    return;
  }

  const imageUrl = data.results[0].urls.full;
  const imgRes = await fetch(imageUrl);
  const buffer = await imgRes.arrayBuffer();
  const outputPath = path.join(imagesDir, filename);
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  console.log(`✅ Imagem salva: assets/images/${filename}`);
}

async function main() {
  for (const scene of script.scenes) {
    const content = scene.content as Record<string, unknown> | undefined ?? {};

    // Busca automática se a cena tiver imageQuery
    if (content.imageQuery && typeof content.imageQuery === "string" && content.imageFile && typeof content.imageFile === "string") {
      await fetchImage(content.imageQuery, content.imageFile);
    }
  }
}

main();
