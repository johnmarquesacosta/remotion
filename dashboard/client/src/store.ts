import { create } from "zustand";

export type PipelineStep = {
  step: number;
  total: number;
  label: string;
  done?: boolean;
  subProgress?: number;
};

export type PipelineStatus = "idle" | "running" | "done" | "error";

interface AppState {
  status: PipelineStatus;
  currentVideoId: string | null;
  steps: PipelineStep[];
  warnings: string[];
  script: object | null;
  error: string | null;

  setStatus: (s: PipelineStatus) => void;
  setVideoId: (id: string) => void;
  addStep: (s: PipelineStep) => void;
  addWarning: (w: string) => void;
  setScript: (s: object) => void;
  setError: (e: string) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  status: "idle",
  currentVideoId: null,
  steps: [],
  warnings: [],
  script: null,
  error: null,

  setStatus: (status) => set({ status }),
  setVideoId: (id) => set({ currentVideoId: id }),
  addStep: (step) => set((s) => ({ steps: [...s.steps.filter(x => x.step !== step.step), step] })),
  addWarning: (w) => set((s) => ({ warnings: [...s.warnings, w] })),
  setScript: (script) => set({ script }),
  setError: (error) => set({ error, status: "error" }),
  reset: () => set({ status: "idle", steps: [], warnings: [], script: null, error: null, currentVideoId: null }),
}));
