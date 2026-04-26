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
Kit de componentes visuais disponíveis (escolha livremente o mais adequado para cada trecho):

- "title": Abre o vídeo com o título animado letra a letra.
- "text-highlight": Texto curto com marca-texto progressivo. Ideal para citações, afirmações e frases de impacto.
- "checklist": Lista animada de 3–6 itens curtos. Ótimo para enumerar passos, características ou benefícios.
- "icon-carousel": Grade de cards com emojis e rótulos. Funciona bem para conjuntos de conceitos distintos (3–6 itens).
- "documentary-layout": Imagem nítida com fundo blur e caixa de texto sobreposta. Para contextualizar pessoas, lugares ou eventos.
- "image-fullscreen": Imagem em tela cheia com legenda sutil. Para momentos de impacto visual ou respiro narrativo.
- "timeline": Linha do tempo com marcos animados. Reservada para conteúdo que tem sequência cronológica clara.
`;

const SYSTEM_PROMPT = `Você é um diretor de vídeo experiente. Seu trabalho é transformar um texto narrado em um roteiro visual expressivo e adequado ao conteúdo.

Dado um título e um texto de narração contínuo, você deve:
1. Dividir o texto em cenas lógicas (cada cena = 1 ideia ou parágrafo principal)
2. Escolher para cada cena o tipo de componente que melhor serve àquele trecho — sem padrão fixo
3. Gerar um script.json válido e completo

${SCENE_TYPES_REFERENCE}

CRITÉRIOS DE ESCOLHA DO TIPO:
- Deixe o conteúdo guiar a escolha. Um trecho de lista vira checklist, um momento emocional pode ser text-highlight, uma introdução de personagem pede documentary-layout, etc.
- Não existe obrigação de usar todos os tipos, nem de evitar repetição. Use o que faz mais sentido.
- Evite apenas seqüências longas do mesmo tipo sem necessidade (ex: 5 text-highlight seguidos sem motivo).

REGRAS TÉCNICAS (estas são obrigatórias):
- A primeira cena é SEMPRE do tipo "title" com durationInSeconds entre 3 e 5
- TODA cena deve ter "imageQuery" dentro de "content": uma busca em inglês, visual e específica (3–6 palavras)
- O campo "narration.text" deve conter o trecho exato da narração daquela cena
- O campo "narration.file" deve ser "scene-XX.mp3" (XX = 01, 02...)
- "text-highlight" requer: "content.text" (frase curta e impactante)
- "checklist" requer: "content.title" e "content.items" (array de strings curtas)
- "icon-carousel" requer: "content.cards" (array de {title, icon}) — use emojis no campo "icon"
- "timeline" requer: "content.markers" (array de {value, label})
- "documentary-layout" requer: "content.infoBoxes" (array de {title, text}) ou "content.title" e "content.subtitle"
- Estime durationInSeconds: 150 palavras/min ≈ 2.5 palavras/segundo (mín: 4s, máx: 15s)

ESTRUTURA DE CADA CENA:
{
  "id": "scene-XX",
  "type": "<tipo>",
  "durationInSeconds": <número>,
  "narration": { "file": "scene-XX.mp3", "text": "<trecho narrado>" },
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
