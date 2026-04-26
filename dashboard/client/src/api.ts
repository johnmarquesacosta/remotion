const BASE = "http://localhost:3333/api";

export interface GenerateInput {
  title: string;
  narrativeText: string;
  channelId: string;
  format: "16:9" | "9:16";
  ttsProvider: "kokoro" | "omnivoice";
}

// ── SSE helper ─────────────────────────────────────────────────────────────
function consumeSSE(
  res: Response,
  onProgress: (event: string, data: any) => void,
  abortRef?: { aborted: boolean }
) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done || abortRef?.aborted) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const eventStr of events) {
        const lines = eventStr.split("\n");
        let eventName = "message";
        let eventData = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) eventName = line.slice(7);
          if (line.startsWith("data: ")) eventData = line.slice(6);
        }
        if (eventData) {
          try {
            onProgress(eventName, JSON.parse(eventData));
          } catch {}
        }
      }
    }
  })();
}

// ── Generate ───────────────────────────────────────────────────────────────
export function startGeneration(
  input: GenerateInput,
  onProgress: (event: string, data: any) => void
): () => void {
  const abortRef = { aborted: false };

  fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) => consumeSSE(res, onProgress, abortRef));

  return () => {
    abortRef.aborted = true;
  };
}

// ── Script ─────────────────────────────────────────────────────────────────
export async function saveScript(videoId: string, script: object) {
  await fetch(`${BASE}/script/${videoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(script),
  });
}

export async function getScript(videoId: string) {
  const res = await fetch(`${BASE}/script/${videoId}`);
  return res.json();
}

export async function listVideos(): Promise<VideoMeta[]> {
  const res = await fetch(`${BASE}/script`);
  return res.json();
}

export interface VideoMeta {
  videoId: string;
  title: string;
  hasScript: boolean;
  sceneCount: number;
  format: string;
  channelId: string;
  hasNarration: boolean;
  narrationCount?: number;
  hasImages: boolean;
  imageCount?: number;
  imageQueryCount?: number;
  hasRender: boolean;
}

// ── Render ──────────────────────────────────────────────────────────────────
export function startRender(
  videoId: string,
  compositionId: string,
  onProgress: (event: string, data: any) => void
) {
  fetch(`${BASE}/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId, compositionId }),
  }).then((res) => consumeSSE(res, onProgress));
}

// ── Assets (imagens) ────────────────────────────────────────────────────────
export interface ImageAsset {
  filename: string;
  url: string;
  size: number;
}

export async function listVideoImages(videoId: string): Promise<ImageAsset[]> {
  const res = await fetch(`${BASE}/assets/${videoId}/images`);
  return res.json();
}

export async function deleteImage(videoId: string, filename: string) {
  await fetch(`${BASE}/assets/${videoId}/images/${filename}`, {
    method: "DELETE",
  });
}

export function fetchImages(
  videoId: string,
  onProgress: (event: string, data: any) => void
) {
  fetch(`${BASE}/assets/${videoId}/fetch-images`, {
    method: "POST",
  }).then((res) => consumeSSE(res, onProgress));
}

// ── Retry TTS ───────────────────────────────────────────────────────────────
export function retryTTS(
  videoId: string,
  ttsProvider: "kokoro" | "omnivoice",
  onProgress: (event: string, data: any) => void
): () => void {
  const abortRef = { aborted: false };

  fetch(`${BASE}/generate/retry-tts/${videoId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ttsProvider }),
  }).then((res) => consumeSSE(res, onProgress, abortRef));

  return () => {
    abortRef.aborted = true;
  };
}

// ── Downloads ───────────────────────────────────────────────────────────────
export function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
