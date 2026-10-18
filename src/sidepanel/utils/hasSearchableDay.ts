import type { Course } from "../types/course";

/**
 * Whether the course has a weekday the syllabus search can use.
 * The site has weekday checkboxes for Mon-Sat only, so Sunday and special courses
 * (day null, e.g. 特設コース2026) are not searched and get no syllabus icon.
 */
export default function hasSearchableDay(course: Course): boolean {
  return course.day !== null && course.day >= 1 && course.day <= 6;
}
