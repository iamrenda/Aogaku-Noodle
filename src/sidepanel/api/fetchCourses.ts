import type { Course, RawCourse } from "../types/course";
import parseCourse from "../utils/parseCourse";
import callMoodleApi from "./callMoodleApi";

/**
 * Fetches the list of courses from the current Moodle tab
 * @returns list of courses
 */
export default async function fetchCourses(): Promise<Course[]> {
  const data = await callMoodleApi<{ courses?: RawCourse[] } | undefined>(
    "core_course_get_enrolled_courses_by_timeline_classification",
    {
      offset: 0,
      limit: 0,
      classification: "inprogress",
      sort: "fullname",
      customfieldname: "week",
    },
  );
  return (data?.courses ?? []).map(parseCourse);
}
