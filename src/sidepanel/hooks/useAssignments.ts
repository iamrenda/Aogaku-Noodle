import { useCallback, useEffect, useState } from "react";
import fetchAssignments from "../api/fetchAssignments";
import { NotOnMoodleError } from "../api/fetchCourses";
import type { Assignment } from "../types/assignment";
import type { Course } from "../types/course";
import type { RefreshError } from "./useCourses";

export type AssignmentsError = RefreshError | "no-courses";

/**
 * Provides saved assignment list from chrome.storage.local
 * `assignments` is null until the saved list is read.
 */
export default function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [error, setError] = useState<AssignmentsError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    chrome.storage.local
      .get("assignments")
      .then((saved) => setAssignments((saved.assignments as Assignment[] | undefined) ?? []));

    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && changes.assignments) {
        setAssignments((changes.assignments.newValue as Assignment[] | undefined) ?? []);
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // The assignments are fetched for the saved courses
      const { courses } = await chrome.storage.local.get("courses");
      const courseIds = ((courses as Course[] | undefined) ?? []).map((c) => c.id);

      if (courseIds.length === 0) {
        setError("no-courses");
        return;
      }
      await chrome.storage.local.set({ assignments: await fetchAssignments(courseIds) });
    } catch (e) {
      console.warn("Failed to refresh assignments:", e);
      setError(e instanceof NotOnMoodleError ? "not-on-moodle" : "failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { assignments, error, isRefreshing, refresh };
}
