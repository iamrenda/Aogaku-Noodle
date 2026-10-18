import type { Assignment, RawAssignmentEvent } from "../types/assignment";
import parseCourse from "./parseCourse";

/**
 * Converts a Moodle calendar event into an Assignment
 * Ex: activityname "第5回 小テスト" in course "木1限_データ構造とアルゴリズム_..."
 * -> { title: "第5回 小テスト", courseName: "データ構造とアルゴリズム", ... }
 */
export default function parseAssignment(raw: RawAssignmentEvent): Assignment {
  return {
    id: raw.id,
    title: raw.activityname,
    courseName: parseCourse(raw.course).title,
    module: raw.modulename,
    dueAt: raw.timesort * 1000,
    link: raw.url,
  };
}
