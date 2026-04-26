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
Tipos de cena disponíveis — TODOS devem ser usados ao longo do vídeo (distribua de forma variada):

- "title": SEMPRE a primeira cena. Exibe o título com animação letra a letra.
- "text-highlight": Texto com marca-texto progressivo. Use para definições, afirmações e citações.
- "checklist": Lista animada de 3 a 6 itens curtos. Use para passos, características ou benefícios.
- "icon-carousel": Galeria de 3+ conceitos com emojis ou ícones. Use para comparações ou listas de entidades.
- "documentary-layout": Imagem de fundo com texto informativo sobreposto. Use para personagens, lugares, eventos.
- "image-fullscreen": Imagem em tela cheia com legenda. Use para momentos de impacto ou transições visuais.
- "timeline": Linha do tempo animada com datas/marcos. Use quando há sequência cronológica.
`;

const SYSTEM_PROMPT = `Você é um diretor de vídeo especialista em transformar textos em roteiros visuais estruturados e cinematográficos.

Dado um título e um texto de narração contínuo, você deve:
1. Dividir o texto em cenas lógicas (cada cena = 1 ideia/parágrafo principal)
2. Variar OBRIGATORIAMENTE os tipos de cena — nunca repita o mesmo tipo mais de 2 vezes consecutivas
3. Usar TODOS os tipos disponíveis ao longo do vídeo sempre que possível
4. Gerar um script.json válido e completo

${SCENE_TYPES_REFERENCE}

REGRAS OBRIGATÓRIAS:
- A primeira cena é SEMPRE do tipo "title" com durationInSeconds entre 3 e 5
- TODA cena (sem exceção) deve ter um campo "imageQuery" com uma busca em inglês, específica e visual (3-6 palavras)
  - Para "text-highlight": imagem de fundo temática que represente o assunto do texto
  - Para "checklist": imagem de fundo que remeta ao tema da lista
  - Para "icon-carousel": imagem de fundo relacionada ao tema do carrossel
  - Para "title": imagem de fundo impactante relacionada ao tema do vídeo
  - Para "timeline": imagem de fundo que represente a época ou o contexto
  - Para "documentary-layout" e "image-fullscreen": imagem principal da cena
- O "imageQuery" deve sempre estar dentro de "content"
- O campo "narration.text" deve conter EXATAMENTE o trecho de narração daquela cena
- O campo "narration.file" deve ser "scene-XX.mp3" (XX = 01, 02...)
- Para "text-highlight": inclua "text" (frase curta e impactante) dentro de "content"
- Para "checklist": inclua "title" e "items" (array de strings curtas) dentro de "content"
- Para "icon-carousel": inclua "cards" (array de {title, icon}) dentro de "content", use emojis no campo "icon"
- Para "timeline": inclua "markers" (array de {value, label}) dentro de "content"
- Estime durationInSeconds: 150 palavras/min ≈ 2.5 palavras/segundo (mín: 4s, máx: 15s)

ESTRUTURA OBRIGATÓRIA DE CADA CENA:
{
  "id": "scene-XX",
  "type": "<tipo>",
  "durationInSeconds": <número>,
  "narration": { "file": "scene-XX.mp3", "text": "<texto da narração>" },
  "content": {
    "imageQuery": "<busca em inglês>",
    <outros campos do tipo>
  }
}

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

Gere o script.json completo seguindo exatamente as instruções.
O campo "channelId" deve ser "${input.channelId}".
O campo "videoId" deve ser "${input.videoId}".
O campo "format" deve ser "${input.format}".
Lembre-se: TODA cena deve ter "imageQuery" dentro de "content". Varie os tipos de cena ao máximo.
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3333",
      "X-Title": "Remotion Dashboard",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-5.4-nano",
      max_tokens: 20000,
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

  // Detecta resposta truncada antes de tentar parsear (evita erros confusos)
  if (!clean.endsWith("}")) {
    throw new Error(
      `Claude retornou um JSON truncado (max_tokens atingido). ` +
      `Última parte recebida: ...${clean.slice(-80)}`
    );
  }

  return JSON.parse(clean) as VideoScript;
}
