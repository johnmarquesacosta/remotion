import fs from "fs";
import path from "path";

const videoId = process.argv[2];
if (!videoId) {
  console.error("Uso: npx tsx scripts/new-video.ts video-003");
  process.exit(1);
}

const templateDir = path.join(__dirname, "../videos/_template");
const targetDir = path.join(__dirname, `../videos/${videoId}`);

if (fs.existsSync(targetDir)) {
  console.error(`Vídeo ${videoId} já existe.`);
  process.exit(1);
}

// Copia template recursivamente
function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, "utf-8");
      content = content.replace(/video-001/g, videoId);
      fs.writeFileSync(destPath, content);
    }
  }
}

copyDir(templateDir, targetDir);
console.log(`✅ Vídeo ${videoId} criado em videos/${videoId}/`);
console.log(`👉 Edite videos/${videoId}/script.json para começar.`);
