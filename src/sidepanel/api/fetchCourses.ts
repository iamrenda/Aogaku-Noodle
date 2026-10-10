import { MOODLE_ORIGIN_URL } from "../const/moodleUrl";
import type { Course, RawCourse } from "../types/course";
import parseCourse from "../utils/parseCourse";

export class NotOnMoodleError extends Error {}
export class FetchFailedError extends Error {}

type PageResult = { courses: RawCourse[] } | { error: string };

// Used iff the user is on a Moodle page
async function requestCoursesInPage(): Promise<PageResult> {
  const sesskey = (window as unknown as { M?: { cfg?: { sesskey?: string } } }).M?.cfg?.sesskey;

  if (!sesskey) return { error: "sesskey not found" };

  const response = await fetch(`/lib/ajax/service.php?sesskey=${encodeURIComponent(sesskey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        index: 0,
        methodname: "core_course_get_enrolled_courses_by_timeline_classification",
        args: { offset: 0, limit: 0, classification: "inprogress", sort: "fullname", customfieldname: "week" },
      },
    ]),
  });
  if (!response.ok) return { error: `HTTP ${response.status}` };

  const body = await response.json();
  if (body?.[0]?.error) return { error: String(body[0].exception?.message ?? "API error") };

  return { courses: body?.[0]?.data?.courses ?? [] };
}

/**
 * Fetches the list of courses from the current Moodle tab
 * @thorws NotOnMoodleError: not on a Moodle page
 * @throws FetchFailedError: failed to fetch courses
 * @returns list of courses
 */
export default async function fetchCourses(): Promise<Course[]> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined || !tab.url?.startsWith(MOODLE_ORIGIN_URL)) throw new NotOnMoodleError();

  let result: PageResult | undefined;
  try {
    [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: requestCoursesInPage,
    });
  } catch (error) {
    throw new FetchFailedError(error instanceof Error ? error.message : String(error));
  }

  if (!result || "error" in result) throw new FetchFailedError(result?.error ?? "no result");
  return result.courses.map(parseCourse);
}
