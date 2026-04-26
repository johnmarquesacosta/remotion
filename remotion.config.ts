import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPublicDir("./public");

// 🚀 Aceleração Gráfica do Chromium (Headless)
// Opções: "angle" | "egl" | "vulkan" | "swiftshader" | "gl" | null
// "angle" é o mais compatível no Windows com GPU NVIDIA
Config.setChromiumOpenGlRenderer("angle");

// Config.setChromiumOpenGlRenderer("angle") was sufficient.

// 🎬 Codec de saída (h264 é o mais compatível; h265 gera arquivos menores)
// Nota: NVENC (hardware encoding) não é configurável via setCodec nesta versão do Remotion.
// Para usar NVENC, passe a flag manualmente: --codec h264 no CLI.
Config.setCodec("h264");

// Opcional: Ajuste de concorrência baseado nos núcleos da sua CPU
// Config.setConcurrency(8);
Config.setHardwareAcceleration("if-possible");