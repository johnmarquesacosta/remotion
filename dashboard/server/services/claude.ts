import fetch from "node-fetch";
import type { VideoScript } from "../../../src/types/scene.types";

export interface GenerateScriptInput {
  videoId: string;
  channelId: string;
  format: "16:9" | "9:16";
  title: string;
  narrativeText: string; // bloco contínuo
}

const SCENE_TYPES_REFERENCE = `
Tipos de cena disponíveis e quando usar cada um:

- "title": SEMPRE a primeira cena. Exibe o título principal com animação letra a letra.
- "text-highlight": Parágrafo de texto com marca-texto progressivo. Ideal para definições, afirmações fortes, citações.
- "checklist": Lista de itens curtos (3-6 itens). Use quando o texto enumera passos, características ou benefícios.
- "icon-carousel": Galeria visual de conceitos/tópicos. Use quando há 3+ entidades distintas sendo comparadas ou listadas.
- "documentary-layout": Imagem principal com caixas de informação ao redor. Ideal para contextualizar personagens, lugares, eventos.
- "image-fullscreen": Imagem em tela cheia com legenda. Use para transições visuais, momentos de impacto.
- "timeline": Linha do tempo com datas/marcos. Use quando o texto tem sequência cronológica.
- "custom": Reservado para cenas especiais — use raramente.
`;

const SYSTEM_PROMPT = `Você é um diretor de vídeo especialista em transformar textos em roteiros visuais estruturados.

Dado um título e um texto de narração contínuo, você deve:
1. Dividir o texto em cenas lógicas (cada cena = 1 ideia/parágrafo principal)
2. Escolher o tipo de componente visual mais adequado para cada trecho
3. Gerar um script.json válido e completo

${SCENE_TYPES_REFERENCE}

REGRAS IMPORTANTES:
- A primeira cena é SEMPRE do tipo "title" com durationInSeconds entre 3 e 5
- Cada cena de narração deve ter entre 4 e 12 segundos (baseado no comprimento do texto)
- O campo "narration.text" deve conter EXATAMENTE o trecho de narração daquela cena
- O campo "narration.file" deve ser "scene-XX.mp3" (XX = número com 2 dígitos: 01, 02...)
- Para cenas com imagem, gere um "imageQuery" em inglês, específico e descritivo (3-6 palavras)
- Para checklist, extraia os itens do texto como array de strings curtas (máx 6 palavras cada)
- Estime durationInSeconds baseado em: 150 palavras por minuto ≈ 2.5 palavras por segundo

RESPONDA APENAS COM O JSON VÁLIDO, sem markdown, sem comentários, sem texto adicional.`;

export async function generateScriptWithClaude(input: GenerateScriptInput): Promise<VideoScript> {
  const userMessage = `
Título do vídeo: "${input.title}"
Canal: ${input.channelId}
Formato: ${input.format}
Video ID: ${input.videoId}

Texto de narração completo:
---
${input.narrativeText}
---

Gere o script.json completo seguindo exatamente o schema VideoScript.
O campo "channelId" deve ser "${input.channelId}".
O campo "videoId" deve ser "${input.videoId}".
O campo "format" deve ser "${input.format}".
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3333", // Site URL for OpenRouter rankings
      "X-Title": "Remotion Dashboard", // Site title for OpenRouter rankings
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "anthropic/claude-opus-4.7",
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
  }

  interface OpenRouterResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }

  const data = (await response.json()) as OpenRouterResponse;
  const rawText = data.choices[0]?.message?.content || "";

  // Remove possíveis marcadores de código se o modelo os incluir mesmo com a instrução
  const clean = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(clean) as VideoScript;
}
