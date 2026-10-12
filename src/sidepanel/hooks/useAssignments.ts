import { useCallback, useEffect, useState } from "react";
import fetchAssignments from "../api/fetchAssignments";
import { NotOnMoodleError } from "../api/callMoodleApi";
import type { Assignment } from "../types/assignment";
import type { Course } from "../types/course";
import type { RefreshError } from "./useCourses";

export type AssignmentsError = RefreshError | "no-courses";

/**
 * Provides saved assignment list and the time it was refreshed from chrome.storage.local
 * `assignments` is null until the saved list is read. `updatedAt` is null if never refreshed.
 */
export default function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<AssignmentsError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(["assignments", "assignmentsUpdatedAt"]).then((saved) => {
      setAssignments((saved.assignments as Assignment[] | undefined) ?? []);
      setUpdatedAt((saved.assignmentsUpdatedAt as number | undefined) ?? null);
    });

    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== "local") return;
      if (changes.assignments)
        setAssignments((changes.assignments.newValue as Assignment[] | undefined) ?? []);
      if (changes.assignmentsUpdatedAt)
        setUpdatedAt((changes.assignmentsUpdatedAt.newValue as number | undefined) ?? null);
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
      await chrome.storage.local.set({
        assignments: await fetchAssignments(courseIds),
        assignmentsUpdatedAt: Date.now(),
      });
    } catch (e) {
      console.warn("Failed to refresh assignments:", e);
      setError(e instanceof NotOnMoodleError ? "not-on-moodle" : "failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { assignments, updatedAt, error, isRefreshing, refresh };
}
