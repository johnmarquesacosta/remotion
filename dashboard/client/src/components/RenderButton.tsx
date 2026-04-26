import React, { useState } from "react";
import { useStore } from "../store";
import { startRender } from "../api";

export const RenderButton: React.FC = () => {
  const { status, currentVideoId, script } = useStore();
  const [renderStatus, setRenderStatus] = useState<"idle" | "rendering" | "done" | "error">("idle");
  const [percent, setPercent] = useState(0);
  const [outputFile, setOutputFile] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  if (status !== "done" || !currentVideoId) return null;

  const handleRender = () => {
    setRenderStatus("rendering");
    setPercent(0);
    setErrorMsg("");
    setLogs([]);

    // compositionId = videoId (ajuste conforme seu Root.tsx)
    const compositionId = currentVideoId;

    startRender(currentVideoId, compositionId, (event, data) => {
      if (event === "progress") setPercent(data.percent ?? percent);
      if (event === "log") setLogs((prev) => [...prev.slice(-50), data.message]);
      if (event === "done") {
        setRenderStatus("done");
        setOutputFile(data.outputFile);
      }
      if (event === "error") {
        setRenderStatus("error");
        setErrorMsg(data.message ?? "Erro desconhecido");
      }
    });
  };

  return (
    <div className="render-section">
      <h3>🎞️ Render Final</h3>

      {renderStatus === "idle" && (
        <button onClick={handleRender} className="render-btn">
          Renderizar MP4
        </button>
      )}

      {renderStatus === "rendering" && (
        <div className="render-progress">
          <div className="progress-track">
            <div className="bar" style={{ width: `${percent}%` }} />
          </div>
          <span>{percent}%</span>
        </div>
      )}

      {renderStatus === "done" && (
        <div className="render-done">
          ✅ Vídeo pronto: <code>{outputFile}</code>
        </div>
      )}

      {renderStatus === "error" && (
        <div className="render-error">
          <strong>❌ Erro no render</strong>
          {errorMsg && <p style={{ fontSize: 12, marginTop: 8, color: "#ff8080" }}>{errorMsg}</p>}
          {logs.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontSize: 12 }}>Ver logs ({logs.length} linhas)</summary>
              <pre style={{ fontSize: 10, maxHeight: 200, overflow: "auto", background: "#1a1a1a", padding: 8, borderRadius: 4, marginTop: 4 }}>
                {logs.join("\n")}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
