import { useCallback, useEffect, useState } from "react";
import fetchAssignments from "../api/fetchAssignments";
import { NotOnMoodleError } from "../api/callMoodleApi";
import type { Assignment } from "../types/assignment";
import type { Course } from "../types/course";
import type { RefreshError } from "./useCourses";

// Hide/unhide writes run one after another, so a fast second click does not overwrite the first
let hiddenWrites: Promise<unknown> = Promise.resolve();

// Forgets hidden ids of assignments that no longer exist. Queued with the other writes so it
// cannot overwrite a hide/unhide click made meanwhile
function removeHidden(ids: number[]) {
  const gone = new Set(ids);
  hiddenWrites = hiddenWrites
    .then(async () => {
      const { hiddenAssignments } = await chrome.storage.local.get("hiddenAssignments");
      const current = (hiddenAssignments as number[] | undefined) ?? [];
      const kept = current.filter((id) => !gone.has(id));
      if (kept.length !== current.length)
        await chrome.storage.local.set({ hiddenAssignments: kept });
    })
    .catch((e) => console.warn("Failed to prune hidden assignments:", e));
}

export type AssignmentsError = RefreshError | "no-courses";

/**
 * Provides saved assignment list and the time it was refreshed from chrome.storage.local
 * `assignments` is null until the saved list is read. `updatedAt` is null if never refreshed.
 */
export default function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [error, setError] = useState<AssignmentsError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    chrome.storage.local
      .get(["assignments", "assignmentsUpdatedAt", "hiddenAssignments"])
      .then((saved) => {
        setAssignments((saved.assignments as Assignment[] | undefined) ?? []);
        setUpdatedAt((saved.assignmentsUpdatedAt as number | undefined) ?? null);
        setHiddenIds((saved.hiddenAssignments as number[] | undefined) ?? []);
      });

    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== "local") return;
      if (changes.hiddenAssignments)
        setHiddenIds((changes.hiddenAssignments.newValue as number[] | undefined) ?? []);
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
      const saved = await chrome.storage.local.get(["hiddenAssignments", "assignments"]);
      const hidden = new Set((saved.hiddenAssignments as number[] | undefined) ?? []);
      const { assignments: fetched, coveredUntil } = await fetchAssignments(courseIds, hidden);
      const fetchedIds = new Set(fetched.map((a) => a.id));
      // A hidden id that is missing from the result may just be past where the fetch stopped.
      // It is gone only if its saved due date is before coveredUntil
      const gone = ((saved.assignments as Assignment[] | undefined) ?? [])
        .filter((a) => hidden.has(a.id) && !fetchedIds.has(a.id) && a.dueAt < coveredUntil)
        .map((a) => a.id);

      await chrome.storage.local.set({ assignments: fetched, assignmentsUpdatedAt: Date.now() });
      if (gone.length > 0) removeHidden(gone);
    } catch (e) {
      console.warn("Failed to refresh assignments:", e);
      setError(e instanceof NotOnMoodleError ? "not-on-moodle" : "failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const setHidden = useCallback((id: number, hidden: boolean) => {
    hiddenWrites = hiddenWrites
      .then(async () => {
        const { hiddenAssignments } = await chrome.storage.local.get("hiddenAssignments");
        const ids = ((hiddenAssignments as number[] | undefined) ?? []).filter((x) => x !== id);
        await chrome.storage.local.set({ hiddenAssignments: hidden ? [...ids, id] : ids });
      })
      // A failed write must not reject the chain, or every later write would be skipped
      .catch((e) => console.warn("Failed to save hidden assignments:", e));
    return hiddenWrites;
  }, []);

  return { assignments, updatedAt, hiddenIds, error, isRefreshing, refresh, setHidden };
}
