import { useCallback, useEffect, useState } from "react";
import fetchCourses, { NotOnMoodleError } from "../api/fetchCourses";
import type { Course } from "../types/course";

export type RefreshError = "not-on-moodle" | "failed";

/**
 * Provides saved course list from chrome.storage.local
 * `courses` is null until the saved list is read.
 */
export default function useCourses() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<RefreshError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("courses").then((saved) => setCourses((saved.courses as Course[] | undefined) ?? []));

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
      await chrome.storage.local.set({ courses: await fetchCourses() });
    } catch (e) {
      console.warn("Failed to refresh courses:", e);
      setError(e instanceof NotOnMoodleError ? "not-on-moodle" : "failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { courses, error, isRefreshing, refresh };
}
