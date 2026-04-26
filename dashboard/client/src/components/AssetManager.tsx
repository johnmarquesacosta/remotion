import React, { useEffect, useState } from "react";
import {
  listVideoImages,
  deleteImage,
  fetchImages,
  downloadFile,
  type ImageAsset,
} from "../api";

interface Props {
  videoId: string;
}

export const AssetManager: React.FC<Props> = ({ videoId }) => {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchLog, setFetchLog] = useState<string[]>([]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const list = await listVideoImages(videoId);
      setImages(list);
    } catch (error) {
      console.error("Erro ao listar imagens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [videoId]);

  const handleDelete = async (filename: string) => {
    if (!confirm(`Deletar ${filename}?`)) return;
    await deleteImage(videoId, filename);
    loadImages();
  };

  const handleFetchImages = () => {
    setFetching(true);
    setFetchLog([]);

    fetchImages(videoId, (event, data) => {
      if (event === "progress") {
        setFetchLog((prev) => [...prev, data.label]);
      }
      if (event === "warning") {
        setFetchLog((prev) => [...prev, `⚠️ ${data.message}`]);
      }
      if (event === "done") {
        setFetching(false);
        setFetchLog((prev) => [...prev, `✅ ${data.message}`]);
        loadImages();
      }
      if (event === "error") {
        setFetching(false);
        setFetchLog((prev) => [...prev, `❌ ${data.message}`]);
      }
    });
  };

  const handleDownload = (image: ImageAsset) => {
    downloadFile(image.url, image.filename);
  };

  const handleDownloadAll = () => {
    images.forEach((img) => {
      setTimeout(() => downloadFile(img.url, img.filename), 200);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="asset-manager">
      <div className="asset-header">
        <h3>🖼️ Assets — {videoId}</h3>
        <div className="asset-header-actions">
          <button
            className="fetch-btn"
            onClick={handleFetchImages}
            disabled={fetching}
          >
            {fetching ? "⏳ Buscando..." : "🔍 Buscar Imagens (Unsplash/Pexels)"}
          </button>
          {images.length > 0 && (
            <button className="download-all-btn" onClick={handleDownloadAll}>
              ⬇️ Baixar Todas
            </button>
          )}
        </div>
      </div>

      {/* Fetch log */}
      {fetchLog.length > 0 && (
        <div className="fetch-log">
          {fetchLog.map((line, i) => (
            <div key={i} className="fetch-log-line">
              {line}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="asset-loading">
          <div className="spinner" />
          <span>Carregando imagens...</span>
        </div>
      ) : images.length === 0 ? (
        <div className="asset-empty">
          <span className="empty-icon">🖼️</span>
          <p>Nenhuma imagem encontrada</p>
          <p className="hint">
            Use o botão acima para buscar imagens do Unsplash/Pexels.
          </p>
        </div>
      ) : (
        <div className="image-grid">
          {images.map((img) => (
            <div key={img.filename} className="image-card">
              <div className="image-preview">
                {/* eslint-disable-next-line remotion/warn-native-media-tag, @remotion/warn-native-media-tag */}
                <img
                  src={img.url}
                  alt={img.filename}
                  loading="lazy"
                />
              </div>
              <div className="image-info">
                <span className="image-name" title={img.filename}>
                  {img.filename}
                </span>
                <span className="image-size">{formatSize(img.size)}</span>
              </div>
              <div className="image-actions">
                <button
                  className="img-action-btn"
                  onClick={() => handleDownload(img)}
                  title="Baixar"
                >
                  ⬇️
                </button>
                <button
                  className="img-action-btn img-delete-btn"
                  onClick={() => handleDelete(img.filename)}
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
