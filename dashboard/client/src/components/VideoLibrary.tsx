import React, { useEffect, useState } from "react";
import {
  listVideos,
  getScript,
  startRender,
  retryTTS,
  downloadFile,
  type VideoMeta,
} from "../api";
import { useStore } from "../store";

interface Props {
  onSelectVideo: (videoId: string) => void;
}

export const VideoLibrary: React.FC<Props> = ({ onSelectVideo }) => {
  const [videos, setVideos] = useState<VideoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [renderingId, setRenderingId] = useState<string | null>(null);
  const [renderPercent, setRenderPercent] = useState(0);
  const [retryingTtsId, setRetryingTtsId] = useState<string | null>(null);
  const { setScript, setVideoId, setStatus } = useStore();

  const loadVideos = async () => {
    setLoading(true);
    try {
      const list = await listVideos();
      setVideos(list);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleSelect = async (videoId: string) => {
    try {
      const script = await getScript(videoId);
      setScript(script);
      setVideoId(videoId);
      setStatus("done");
      onSelectVideo(videoId);
    } catch {}
  };

  const handleRender = (videoId: string) => {
    setRenderingId(videoId);
    setRenderPercent(0);

    startRender(videoId, videoId, (event, data) => {
      if (event === "progress" && data.percent)
        setRenderPercent(data.percent);
      if (event === "done") {
        setRenderingId(null);
        loadVideos(); // refresh to show render badge
      }
      if (event === "error") {
        setRenderingId(null);
      }
    });
  };

  const handleDownload = (videoId: string) => {
    downloadFile(`/videos/${videoId}/${videoId}.mp4`, `${videoId}.mp4`);
  };

  const handleRetryTTS = (videoId: string) => {
    setRetryingTtsId(videoId);

    retryTTS(videoId, "kokoro", (event, data) => {
      if (event === "warning") {
        console.warn(`[RetryTTS] ${data.message}`);
      }
      if (event === "done") {
        setRetryingTtsId(null);
        alert(`✅ ${data.message}`);
        loadVideos();
      }
      if (event === "error") {
        setRetryingTtsId(null);
        alert(`❌ Erro no retry TTS: ${data.message}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="video-library">
        <h2>📂 Biblioteca de Vídeos</h2>
        <div className="library-loading">
          <div className="spinner" />
          <span>Carregando vídeos...</span>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-library">
        <h2>📂 Biblioteca de Vídeos</h2>
        <div className="library-empty">
          <span className="empty-icon">🎬</span>
          <p>Nenhum vídeo encontrado</p>
          <p className="hint">Gere seu primeiro vídeo na aba "Gerar"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-library">
      <div className="library-header">
        <h2>📂 Biblioteca de Vídeos</h2>
        <button className="refresh-btn" onClick={loadVideos} title="Recarregar">
          🔄
        </button>
      </div>

      <div className="video-grid">
        {videos.map((v) => (
          <div key={v.videoId} className="video-card">
            <div className="card-header">
              <h3 className="card-title">{v.title}</h3>
              <span className="card-format">{v.format}</span>
            </div>

            <div className="card-badges">
              <span className="badge">🎬 {v.sceneCount} cenas</span>
              {v.hasNarration && (
                <span className="badge badge-success">
                  🎙️ {v.narrationCount} áudios
                </span>
              )}
              {v.hasImages && (
                <span className="badge badge-success">
                  🖼️ {v.imageCount} imagens
                </span>
              )}
              {v.hasRender && (
                <span className="badge badge-accent">📹 Renderizado</span>
              )}
            </div>

            <div className="card-id">{v.videoId}</div>

            <div className="card-actions">
              <button
                className="action-btn select-btn"
                onClick={() => handleSelect(v.videoId)}
                title="Abrir script no editor"
              >
                📄 Abrir
              </button>

              <button
                className="action-btn assets-btn"
                onClick={() => onSelectVideo(v.videoId)}
                title="Gerenciar assets"
              >
                🖼️ Assets
              </button>

              {renderingId === v.videoId ? (
                <div className="card-render-progress">
                  <div className="mini-progress-track">
                    <div
                      className="bar"
                      style={{ width: `${renderPercent}%` }}
                    />
                  </div>
                  <span className="mini-percent">{renderPercent}%</span>
                </div>
              ) : (
                <button
                  className="action-btn render-btn"
                  onClick={() => handleRender(v.videoId)}
                  disabled={renderingId !== null}
                  title="Renderizar MP4"
                >
                  🎞️ Render
                </button>
              )}

              {v.hasRender && (
                <button
                  className="action-btn download-btn"
                  onClick={() => handleDownload(v.videoId)}
                  title="Baixar MP4"
                >
                  ⬇️ MP4
                </button>
              )}

              <button
                className="action-btn retry-tts-btn"
                onClick={() => handleRetryTTS(v.videoId)}
                disabled={retryingTtsId !== null || renderingId !== null}
                title="Re-gerar áudios TTS ausentes (3 tentativas com backoff)"
              >
                {retryingTtsId === v.videoId ? "⏳ TTS..." : "🔁 Re-TTS"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
