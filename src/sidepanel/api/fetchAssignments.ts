import { MODULE_LABELS } from "../const/moduleLabels";
import type { Assignment, RawAssignmentEvent } from "../types/assignment";
import parseAssignment from "../utils/parseAssignment";
import callMoodleApi from "./callMoodleApi";

// Events requested per course
const EVENTS_PER_COURSE = 50;

/**
 * Fetches the assignments of the given courses from the current Moodle tab (up to 50 per course)
 * @returns assignments sorted by deadline
 */
export default async function fetchAssignments(courseIds: number[]): Promise<Assignment[]> {
  const data = await callMoodleApi<{ groupedbycourse?: { events?: RawAssignmentEvent[] }[] } | undefined>(
    "core_calendar_get_action_events_by_courses",
    { courseids: courseIds, timesortfrom: 0, limitnum: EVENTS_PER_COURSE },
  );
  const events = (data?.groupedbycourse ?? []).flatMap((group) => group.events ?? []);

  return (
    events
      // "open" events only say when something starts. The deadline is the "due" or "close" event
      .filter((e) => e.eventtype !== "open" && Object.hasOwn(MODULE_LABELS, e.modulename))
      .map(parseAssignment)
      .sort((a, b) => a.dueAt - b.dueAt)
  );
}
