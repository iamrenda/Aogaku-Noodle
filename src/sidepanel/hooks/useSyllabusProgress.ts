import { create } from "zustand";

export type SyllabusProgress = {
  fetched: number;
  total: number;
};

type State = {
  progress: SyllabusProgress | null;
  setProgress: (progress: SyllabusProgress | null) => void;
};

/**
 * In-memory progress of the running syllabus search, shared by the whole side panel.
 * `progress` is null while nothing is being fetched. Not saved, so it can never go stale.
 * Outside React, use `useSyllabusProgress.getState().setProgress(...)`.
 */
const useSyllabusProgress = create<State>((set) => ({
  progress: null,
  setProgress: (progress) => set({ progress }),
}));

export default useSyllabusProgress;
