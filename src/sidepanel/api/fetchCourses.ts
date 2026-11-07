import type { Course, RawCourse } from "../types/course";
import parseCourse from "../utils/parseCourse";
import callMoodleApi from "./callMoodleApi";

export type CourseClassification = "inprogress" | "all";

/**
 * Fetches the list of courses from the current Moodle tab
 * @param classification "inprogress" for the current courses, "all" to include past ones
 * @returns list of courses
 */
export default async function fetchCourses(
  classification: CourseClassification = "inprogress",
): Promise<Course[]> {
  const data = await callMoodleApi<{ courses?: RawCourse[] } | undefined>(
    "core_course_get_enrolled_courses_by_timeline_classification",
    {
      offset: 0,
      limit: 0,
      classification,
      sort: "fullname",
      customfieldname: "week",
    },
  );
  return (data?.courses ?? []).map(parseCourse);
}
