import { MOODLE_ORIGIN_URL } from "../const/moodleUrl";
import { MODULE_LABELS } from "../const/moduleLabels";
import type { Assignment, RawAssignmentEvent } from "../types/assignment";
import parseAssignment from "../utils/parseAssignment";
import { FetchFailedError, NotOnMoodleError } from "./fetchCourses";

// Events requested per course
const EVENTS_PER_COURSE = 50;

type MoodleResponse = {
  error?: boolean;
  exception?: { message?: string };
  data?: { groupedbycourse?: { events?: RawAssignmentEvent[] }[] };
}[];
type PageResult = { events: RawAssignmentEvent[] } | { error: string };

// Used iff the user is on a Moodle page, it will run
async function requestEventsInPage(courseIds: number[], limit: number): Promise<PageResult> {
  const sesskey = (window as unknown as { M?: { cfg?: { sesskey?: string } } }).M?.cfg?.sesskey;

  if (!sesskey) return { error: "sesskey not found" };

  const response = await fetch(`/lib/ajax/service.php?sesskey=${encodeURIComponent(sesskey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        index: 0,
        methodname: "core_calendar_get_action_events_by_courses",
        args: { courseids: courseIds, timesortfrom: 0, limitnum: limit },
      },
    ]),
  });
  if (!response.ok) return { error: `HTTP ${response.status}` };

  const body: MoodleResponse = await response.json();
  if (body?.[0]?.error) return { error: String(body[0].exception?.message ?? "API error") };

  // The full events carry a large course image, so only the needed fields are sent back
  const events = (body?.[0]?.data?.groupedbycourse ?? []).flatMap((group) => group.events ?? []);

  return {
    events: events.map((e) => ({
      id: e.id,
      activityname: e.activityname,
      modulename: e.modulename,
      eventtype: e.eventtype,
      timesort: e.timesort,
      url: e.url,
      course: {
        id: e.course.id,
        fullname: e.course.fullname,
        idnumber: e.course.idnumber,
        viewurl: e.course.viewurl,
        coursecategory: e.course.coursecategory,
      },
    })),
  };
}

/**
 * Fetches the assignments of the given courses from the current Moodle tab (up to 50 per course)
 * @throws NotOnMoodleError: not on a Moodle page
 * @throws FetchFailedError: failed to fetch assignments
 * @returns assignments sorted by deadline
 */
export default async function fetchAssignments(courseIds: number[]): Promise<Assignment[]> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined || !tab.url?.startsWith(MOODLE_ORIGIN_URL)) throw new NotOnMoodleError();

  let result: PageResult | undefined;
  try {
    [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: requestEventsInPage,
      args: [courseIds, EVENTS_PER_COURSE],
    });
  } catch (error) {
    throw new FetchFailedError(error instanceof Error ? error.message : String(error));
  }

  if (!result || "error" in result) throw new FetchFailedError(result?.error ?? "no result");

  return (
    result.events
      // "open" events only say when something starts. The deadline is the "due" or "close" event
      .filter((e) => e.eventtype !== "open" && Object.hasOwn(MODULE_LABELS, e.modulename))
      .map(parseAssignment)
      .sort((a, b) => a.dueAt - b.dueAt)
  );
}
