import { PAGE_SIZE } from "../const/assignments";
import { MODULE_LABELS } from "../const/moduleLabels";
import type { Assignment, RawAssignmentEvent } from "../types/assignment";
import parseAssignment from "../utils/parseAssignment";
import callMoodleApi, { NotOnMoodleError } from "./callMoodleApi";

const EVENTS_PER_CALL = 50;
const MAX_ROUNDS = 20;

type EventsResponse = { events?: RawAssignmentEvent[]; lastid?: number | null } | undefined;

export type FetchedAssignments = {
  assignments: Assignment[];
  // Events were read up to this time (epoch ms, exclusive). Infinity if all events were read.
  // An assignment due before it that is missing from `assignments` is really gone
  coveredUntil: number;
};

/**
 * Fetches the assignments of the given courses from the current Moodle tab.
 * Reads the user's events oldest first, 50 per call, and keeps reading the following events
 * (cursor: aftereventid) until at least PAGE_SIZE unhidden assignments are found.
 * @returns assignments (hidden ones included) sorted by deadline, and how far the events were read
 */
export default async function fetchAssignments(
  courseIds: number[],
  hiddenIds: Set<number>,
): Promise<FetchedAssignments> {
  const wantedCourses = new Set(courseIds);
  const found = new Map<number, Assignment>();
  let afterEventId: number | undefined;
  let coveredUntil = 0;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    let data: EventsResponse;
    try {
      data = await callMoodleApi<EventsResponse>("core_calendar_get_action_events_by_timesort", {
        timesortfrom: 0,
        limitnum: EVENTS_PER_CALL,
        ...(afterEventId === undefined ? {} : { aftereventid: afterEventId }),
      });
    } catch (e) {
      // Keep what the earlier calls found. Only the first call's failure fails the refresh.
      // Leaving Moodle mid-fetch always fails it, or the partial list would be saved as fresh
      if (round === 0 || e instanceof NotOnMoodleError) throw e;
      console.warn("Stopped fetching assignments early:", e);
      break;
    }
    const events = data?.events ?? [];
    // Events come oldest first, so an empty batch means every event was read
    if (events.length === 0) {
      coveredUntil = Infinity;
      break;
    }
    coveredUntil = events[events.length - 1].timesort * 1000;

    for (const event of events) {
      // "open" events only say when something starts. The deadline is the "due" or "close" event.
      // "gradingdue" is the teacher's grading deadline, not the student's
      if (event.eventtype === "open" || event.eventtype === "gradingdue") continue;
      if (!Object.hasOwn(MODULE_LABELS, event.modulename)) continue;
      // The API returns the events of every enrolled course, not only the saved ones
      if (!wantedCourses.has(event.course.id)) continue;
      const assignment = parseAssignment(event);
      found.set(assignment.id, assignment);
    }

    const unhiddenCount = [...found.keys()].filter((id) => !hiddenIds.has(id)).length;
    if (unhiddenCount >= PAGE_SIZE) break;

    // Moodle can return fewer than the limit while more events remain, so only an empty batch
    // means the end. The cursor must move, or it would loop
    if (!data?.lastid || data.lastid === afterEventId) break;
    afterEventId = data.lastid;
  }

  return { assignments: [...found.values()].sort((a, b) => a.dueAt - b.dueAt), coveredUntil };
}
