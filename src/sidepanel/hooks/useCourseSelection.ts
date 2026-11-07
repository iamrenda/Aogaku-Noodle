import { useCallback, useEffect, useState } from "react";
import { NotOnMoodleError } from "../api/callMoodleApi";
import fetchCourses from "../api/fetchCourses";
import type { Course } from "../types/course";
import type { SyllabusMap } from "../types/syllabus";
import hasSearchableDay from "../utils/hasSearchableDay";
import mergeCourseSelection from "../utils/mergeCourseSelection";
import { enqueueSelectionWrite, readSelection, saveSelection } from "../utils/selectionStore";
import type { RefreshError } from "./useCourses";
import { searchSyllabuses } from "./useCourses";

// Two searches for the same newly selected courses must not run at once
let addedSearch: Promise<void> | null = null;

/**
 * Provides every course and which of them are selected (chrome.storage.local `allCourses`,
 * `includedCourseIds`). `courses` is kept equal to the selected ones, so the other screens
 * only read `courses`. `allCourses` is null until read.
 */
export default function useCourseSelection() {
  const [allCourses, setAllCourses] = useState<Course[] | null>(null);
  const [includedIds, setIncludedIds] = useState<number[]>([]);
  const [error, setError] = useState<RefreshError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let latest = 0;
    const load = () => {
      // Only the newest read may set the state, or an older one finishing late would win
      const request = ++latest;
      readSelection().then((selection) => {
        if (request !== latest) return;
        setAllCourses(selection.allCourses);
        setIncludedIds(selection.includedIds);
      });
    };
    load();

    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && (changes.courses || changes.allCourses || changes.includedCourseIds))
        load();
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  const toggle = useCallback(
    (id: number) =>
      enqueueSelectionWrite(async () => {
        const { allCourses, includedIds } = await readSelection();
        const next = includedIds.includes(id)
          ? includedIds.filter((x) => x !== id)
          : [...includedIds, id];
        await saveSelection(allCourses, next);
      }).catch((e) => console.warn("Failed to save course selection:", e)),
    [],
  );

  /** Fetches every course (past ones too) and merges it with the current selection */
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const [all, inProgress] = await Promise.all([
        fetchCourses("all"),
        fetchCourses("inprogress"),
      ]);
      const inProgressIds = new Set(inProgress.map((c) => c.id));
      // The merge reads the selection inside the queue, so a toggle made meanwhile is kept
      await enqueueSelectionWrite(async () => {
        const merged = mergeCourseSelection(await readSelection(), all, inProgressIds);
        await saveSelection(merged.allCourses, merged.includedIds);
      });
    } catch (e) {
      console.warn("Failed to refresh all courses:", e);
      setError(e instanceof NotOnMoodleError ? "not-on-moodle" : "failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /** Searches the syllabuses of selected courses that have none saved yet (newly added ones) */
  const searchAddedSyllabuses = useCallback(() => {
    if (addedSearch) return addedSearch;
    addedSearch = (async () => {
      try {
        // Wait for pending toggles so the newest selection is searched
        await enqueueSelectionWrite(async () => undefined);
        const saved = await chrome.storage.local.get(["courses", "syllabuses"]);
        const searched = (saved.syllabuses as SyllabusMap | undefined) ?? {};
        const added = ((saved.courses as Course[] | undefined) ?? []).filter(
          (c) => !(c.id in searched) && hasSearchableDay(c),
        );
        if (added.length > 0) await searchSyllabuses(added, true);
      } finally {
        addedSearch = null;
      }
    })();
    return addedSearch;
  }, []);

  return {
    allCourses,
    includedIds,
    error,
    isRefreshing,
    toggle,
    refreshAll,
    searchAddedSyllabuses,
  };
}
