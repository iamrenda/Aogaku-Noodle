import type { Course } from "../types/course";
import type { SyllabusMap } from "../types/syllabus";
import createWriteQueue from "./createWriteQueue";

/** Every write of `courses`, `allCourses` and `includedCourseIds` goes through this queue */
export const enqueueSelectionWrite = createWriteQueue();

/** Every write of `syllabuses` goes through this queue */
export const enqueueSyllabusWrite = createWriteQueue();

/**
 * Reads the saved selection. Installs from before course selection only have `courses`,
 * so those count as all courses, all selected.
 */
export async function readSelection() {
  const saved = await chrome.storage.local.get(["courses", "allCourses", "includedCourseIds"]);
  const courses = (saved.courses as Course[] | undefined) ?? [];
  const allCourses = (saved.allCourses as Course[] | undefined) ?? courses;
  const includedIds =
    (saved.includedCourseIds as number[] | undefined) ?? allCourses.map((c) => c.id);
  return { allCourses, includedIds };
}

/** Saves the selection and the selected courses (`courses`) together */
export function saveSelection(allCourses: Course[], includedIds: number[]) {
  const included = new Set(includedIds);
  return chrome.storage.local.set({
    allCourses,
    includedCourseIds: includedIds,
    courses: allCourses.filter((c) => included.has(c.id)),
  });
}

/** Merges search results into the saved `syllabuses` (or replaces them all) */
export function saveSyllabuses(results: SyllabusMap, merge: boolean) {
  return enqueueSyllabusWrite(async () => {
    const saved = await chrome.storage.local.get("syllabuses");
    const current = merge ? ((saved.syllabuses as SyllabusMap | undefined) ?? {}) : {};
    await chrome.storage.local.set({ syllabuses: { ...current, ...results } });
  });
}
