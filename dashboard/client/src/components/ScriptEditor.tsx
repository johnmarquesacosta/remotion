import React, { useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useStore } from "../store";
import { saveScript } from "../api";

export const ScriptEditor: React.FC = () => {
  const { script, currentVideoId, status } = useStore();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (script) setValue(JSON.stringify(script, null, 2));
  }, [script]);

  if (status !== "done" || !script) return null;

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(value);
      await saveScript(currentVideoId!, parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("JSON inválido — verifique a sintaxe antes de salvar.");
    }
  };

  return (
    <div className="script-editor">
      <div className="editor-header">
        <h3>📄 script.json — Ajuste Fino</h3>
        <button onClick={handleSave} className="save-btn">{saved ? "✅ Salvo!" : "💾 Salvar"}</button>
      </div>
      <div className="editor-container">
        <MonacoEditor
          height="500px"
          language="json"
          theme="vs-dark"
          value={value}
          onChange={v => setValue(v ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: "on",
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );
};
