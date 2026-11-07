import type { Course } from "../types/course";

export type CourseSelection = {
  allCourses: Course[];
  includedIds: number[];
};

/**
 * Combines a fresh "all courses" fetch with the user's earlier choices.
 * Keeps the choice for every course seen before, selects unseen in-progress courses,
 * and drops courses that no longer exist.
 */
export default function mergeCourseSelection(
  previous: CourseSelection,
  fetchedAll: Course[],
  inProgressIds: Set<number>,
): CourseSelection {
  const knownIds = new Set(previous.allCourses.map((c) => c.id));
  const previouslyIncluded = new Set(previous.includedIds);

  const allCourses = fetchedAll.map((course) => ({
    ...course,
    isInProgress: inProgressIds.has(course.id),
  }));
  const includedIds = allCourses
    .filter((c) => (knownIds.has(c.id) ? previouslyIncluded.has(c.id) : c.isInProgress))
    .map((c) => c.id);

  return { allCourses, includedIds };
}
