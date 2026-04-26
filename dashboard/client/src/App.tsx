import React, { useState } from "react";
import { GenerateForm } from "./components/GenerateForm";
import { PipelineProgress } from "./components/PipelineProgress";
import { ScriptEditor } from "./components/ScriptEditor";
import { RenderButton } from "./components/RenderButton";
import { VideoLibrary } from "./components/VideoLibrary";
import { AssetManager } from "./components/AssetManager";
import { useStore } from "./store";
import "./App.css";

type Tab = "generate" | "library";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { currentVideoId } = useStore();

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  // The video to show in AssetManager — from library selection or from generation
  const assetVideoId = selectedVideoId || currentVideoId;

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>🎬 Remotion Studio</h1>
          <nav className="tabs">
            <button
              className={`tab ${activeTab === "generate" ? "active" : ""}`}
              onClick={() => setActiveTab("generate")}
            >
              🚀 Gerar
            </button>
            <button
              className={`tab ${activeTab === "library" ? "active" : ""}`}
              onClick={() => setActiveTab("library")}
            >
              📂 Biblioteca
            </button>
          </nav>
        </div>
      </header>

      {activeTab === "generate" && (
        <main>
          <div className="left-panel">
            <GenerateForm />
          </div>

          <div className="right-panel">
            <PipelineProgress />
            <ScriptEditor />
            <RenderButton />
            {currentVideoId && (
              <AssetManager videoId={currentVideoId} />
            )}
          </div>
        </main>
      )}

      {activeTab === "library" && (
        <main className="library-layout">
          <VideoLibrary onSelectVideo={handleSelectVideo} />
          {assetVideoId && (
            <AssetManager videoId={assetVideoId} />
          )}
        </main>
      )}
    </div>
  );
};

export default App;
