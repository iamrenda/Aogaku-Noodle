import { useCallback, useEffect, useState } from "react";
import { NotOnMoodleError } from "../api/callMoodleApi";
import fetchCourses from "../api/fetchCourses";
import fetchSyllabuses from "../api/fetchSyllabuses";
import type { Course } from "../types/course";
import useSyllabusProgress from "./useSyllabusProgress";

export type RefreshError = "not-on-moodle" | "failed";

/**
 * Saves the syllabus search results. Skipped while no major is selected.
 * A failure is only logged so it never turns a course refresh into an error.
 */
async function searchSyllabuses(courses: Course[]) {
  const saved = await chrome.storage.local.get("selectedMajor");
  const major = saved.selectedMajor as string | undefined;

  if (!major) return;

  try {
    const syllabuses = await fetchSyllabuses(courses, major, (fetched, total) =>
      useSyllabusProgress.getState().setProgress({ fetched, total }),
    );
    await chrome.storage.local.set({ syllabuses });
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
      await chrome.storage.local.set({ courses: fetched });
      await searchSyllabuses(fetched);
    } catch (e) {
      console.warn("Failed to refresh courses:", e);
      setError(e instanceof NotOnMoodleError ? "not-on-moodle" : "failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Searches the syllabuses of the saved courses (after the major is selected).
   * Fetches the courses first when none are saved.
   */
  const refreshSyllabuses = useCallback(async () => {
    const saved = await chrome.storage.local.get("courses");
    const savedCourses = (saved.courses as Course[] | undefined) ?? [];
    if (savedCourses.length === 0) return refresh();

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
