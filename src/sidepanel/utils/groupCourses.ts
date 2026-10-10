import { DAYS_IN_JPN } from "../const/days";
import type { Course } from "../types/course";

export type CourseSection = {
  key: string;
  title: string;
  day: number | null; // null for Moodle categories
  courses: Course[];
};

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const periodRank = (course: Course) => (course.isOnline ? 98 : (course.period ?? 99));

/**
 * Group and Order courses
 * (ORDER) Weekday sections -> Moodle category (ex. "特設コース")
 */
export default function groupCourses(courses: Course[]): CourseSection[] {
  const weekdaySections: CourseSection[] = WEEK_ORDER.map((day) => ({
    key: `day-${day}`,
    title: DAYS_IN_JPN[day],
    day,
    courses: courses.filter((course) => course.day === day),
  }));

  const undated = courses.filter((course) => course.day === null);
  const categories = [...new Set(undated.map((course) => course.category))];
  const categorySections: CourseSection[] = categories.map((category) => ({
    key: `category-${category}`,
    title: category || "その他",
    day: null,
    courses: undated.filter((course) => course.category === category),
  }));

  return [...weekdaySections, ...categorySections]
    .filter((section) => section.courses.length > 0)
    .map((section) => ({
      ...section,
      courses: [...section.courses].sort((a, b) => periodRank(a) - periodRank(b)),
    }));
}
