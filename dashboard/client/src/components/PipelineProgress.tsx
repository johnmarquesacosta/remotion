import React from "react";
import { useStore } from "../store";

const STEP_ICONS = ["", "🤖", "🎙️", "🖼️", "✅"];
const STEP_NAMES = ["", "Roteiro Claude", "Narração TTS", "Assets", "Concluído"];

export const PipelineProgress: React.FC = () => {
  const { status, steps, warnings, error } = useStore();

  if (status === "idle") return null;

  return (
    <div className="pipeline-progress">
      <h3>Pipeline</h3>

      <div className="steps">
        {[1, 2, 3, 4].map(n => {
          const step = steps.find(s => s.step === n);
          const isDone = step?.done;
          const isActive = step && !isDone;
          return (
            <div key={n} className={`step ${isDone ? "done" : isActive ? "active" : "pending"}`}>
              <span className="icon">{STEP_ICONS[n]}</span>
              <span className="name">{STEP_NAMES[n]}</span>
              {isActive && <span className="label">{step.label}</span>}
              {isDone && <span className="check">✓</span>}
            </div>
          );
        })}
      </div>

      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((w, i) => <div key={i} className="warning">⚠️ {w}</div>)}
        </div>
      )}

      {error && <div className="error">❌ {error}</div>}
    </div>
  );
};
