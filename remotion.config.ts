import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPublicDir("./public");

// Para suporte a múltiplos formatos, use props na composição
// 16:9: 1920x1080 | 9:16: 1080x1920
