import type { RawCourse } from "./course";

export type AssignmentModule = "assign" | "questionnaire" | "resource";

// Slimmed-down Moodle calendar action event (core_calendar_get_action_events_by_timesort)
export type RawAssignmentEvent = {
  id: number;
  activityname: string;
  modulename: string;
  eventtype: string; // "due", "open", "close", "expectcompletionon", ...
  timesort: number; // epoch seconds
  url: string;
  course: RawCourse;
};

export type Assignment = {
  id: number;
  title: string;
  courseName: string;
  module: AssignmentModule;
  // Deadline as epoch ms
  dueAt: number;
  link: string;
};
