import { useCallback, useEffect, useState } from "react";
import { NotOnMoodleError } from "../api/callMoodleApi";
import fetchCourses from "../api/fetchCourses";
import fetchSyllabuses from "../api/fetchSyllabuses";
import type { Course } from "../types/course";
import mergeCourseSelection from "../utils/mergeCourseSelection";
import {
  enqueueSelectionWrite,
  readSelection,
  saveSelection,
  saveSyllabuses,
} from "../utils/selectionStore";
import useSyllabusProgress from "./useSyllabusProgress";

export type RefreshError = "not-on-moodle" | "failed";

/**
 * Saves the syllabus search results. Skipped while no major is selected.
 * `merge` keeps the results of other courses (used when only some courses are searched).
 * A failure is only logged so it never turns a course refresh into an error.
 */
export async function searchSyllabuses(courses: Course[], merge = false) {
  const saved = await chrome.storage.local.get("selectedMajor");
  const major = saved.selectedMajor as string | undefined;

  if (!major) return;

  try {
    const syllabuses = await fetchSyllabuses(courses, major, (fetched, total) =>
      useSyllabusProgress.getState().setProgress({ fetched, total }),
    );
    await saveSyllabuses(syllabuses, merge);
  } catch (e) {
    console.warn("Failed to search syllabuses:", e);
  } finally {
    useSyllabusProgress.getState().setProgress(null);
  }
}

/**
 * Provides saved course list from chrome.storage.local
 * `courses` is null until the saved list is read.
 */
export default function useCourses() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<RefreshError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    chrome.storage.local
      .get("courses")
      .then((saved) => setCourses((saved.courses as Course[] | undefined) ?? []));

    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && changes.courses) {
        setCourses((changes.courses.newValue as Course[] | undefined) ?? []);
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const fetched = await fetchCourses();
      const inProgressIds = new Set(fetched.map((c) => c.id));
      // Merged with the saved selection (not overwritten), inside the queue shared with toggling
      const selected = await enqueueSelectionWrite(async () => {
        const merged = mergeCourseSelection(await readSelection(), fetched, inProgressIds);
        await saveSelection(merged.allCourses, merged.includedIds);
        const included = new Set(merged.includedIds);
        return merged.allCourses.filter((c) => included.has(c.id));
      });
      await searchSyllabuses(selected);
    } catch (e) {
      console.warn("Failed to refresh courses:", e);
      setError(e instanceof NotOnMoodleError ? "not-on-moodle" : "failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Searches the syllabuses of the saved courses (after the major is selected).
   * Fetches the courses first when none were ever saved.
   */
  const refreshSyllabuses = useCallback(async () => {
    const saved = await chrome.storage.local.get(["courses", "allCourses"]);
    const savedCourses = (saved.courses as Course[] | undefined) ?? [];
    const hasAnyCourse = ((saved.allCourses as Course[] | undefined)?.length ?? 0) > 0;
    if (savedCourses.length === 0) {
      // Fetch only when nothing was ever fetched. If all were deselected there is nothing to search
      return hasAnyCourse ? undefined : refresh();
    }

    setIsRefreshing(true);
    setError(null);
    try {
      await searchSyllabuses(savedCourses);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  return { courses, error, isRefreshing, refresh, refreshSyllabuses };
}
