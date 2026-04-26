import React, { useState } from "react";
import { startGeneration, type GenerateInput } from "../api";
import { useStore } from "../store";

const CHANNELS = ["channel-default", "channel-tech", "channel-history", "channel-lifestyle"];

export const GenerateForm: React.FC = () => {
  const { status, reset, setStatus, setVideoId, addStep, addWarning, setScript, setError } = useStore();
  const [form, setForm] = useState<GenerateInput>({
    title: "",
    narrativeText: "",
    channelId: "channel-default",
    format: "16:9",
    ttsProvider: "kokoro",
  });

  const handleSubmit = () => {
    reset();
    setStatus("running");

    startGeneration(form, (event, data) => {
      if (event === "progress") {
        addStep(data);
        if (data.videoId) setVideoId(data.videoId);
      }
      if (event === "warning") addWarning(data.message);
      if (event === "done") {
        setScript(data.script);
        setVideoId(data.videoId);
        setStatus("done");
      }
      if (event === "error") setError(data.message);
    });
  };

  const isRunning = status === "running";

  return (
    <div className="generate-form">
      <h2>Novo Vídeo</h2>

      <div className="field">
        <label>Título</label>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Ex: Os 5 pilares do React"
          disabled={isRunning}
        />
      </div>

      <div className="field">
        <label>Texto de Narração</label>
        <textarea
          value={form.narrativeText}
          onChange={e => setForm(f => ({ ...f, narrativeText: e.target.value }))}
          placeholder="Cole aqui o texto completo que será narrado..."
          rows={10}
          disabled={isRunning}
        />
      </div>

      <div className="row">
        <div className="field">
          <label>Canal</label>
          <select
            value={form.channelId}
            onChange={e => setForm(f => ({ ...f, channelId: e.target.value }))}
            disabled={isRunning}
          >
            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Formato</label>
          <select
            value={form.format}
            onChange={e => setForm(f => ({ ...f, format: e.target.value as "16:9" | "9:16" }))}
            disabled={isRunning}
          >
            <option value="16:9">16:9 (YouTube/Desktop)</option>
            <option value="9:16">9:16 (Reels/Shorts)</option>
          </select>
        </div>

        <div className="field">
          <label>TTS</label>
          <select
            value={form.ttsProvider}
            onChange={e => setForm(f => ({ ...f, ttsProvider: e.target.value as "kokoro" | "omnivoice" }))}
            disabled={isRunning}
          >
            <option value="kokoro">Kokoro</option>
            <option value="omnivoice">Omnivoice</option>
          </select>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={isRunning || !form.title || !form.narrativeText}>
        {isRunning ? "⏳ Processando..." : "🚀 Gerar Vídeo"}
      </button>
    </div>
  );
};
