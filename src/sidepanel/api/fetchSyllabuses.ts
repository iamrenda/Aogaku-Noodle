import { FACULTIES, GENERAL_MAJOR_CODE } from "../const/majors";
import type { Course } from "../types/course";
import type { Syllabus, SyllabusMap } from "../types/syllabus";
import hasSearchableDay from "../utils/hasSearchableDay";

const SYLLABUS_ORIGIN = "https://syllabus.aoyama.ac.jp/";

function getMajorCodes(majorLabel: string): string[] {
  const major = FACULTIES.flatMap((f) => f.majors).find((m) => m.label === majorLabel);
  return [...(major?.code ?? []), GENERAL_MAJOR_CODE];
}

/** The academic year starts in April */
function getAcademicYear(): number {
  const now = new Date();
  return now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
}

function buildSearchUrl(course: Course, majorCodes: string[], withLecturer: boolean): string {
  const params = new URLSearchParams({
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATEGENERATOR: "309A73F1",
    YR: String(getAcademicYear()),
    BU: "BU1",
    KW: "",
    KM: course.title,
    KI: withLecturer ? (course.lecturer ?? "") : "",
    GKB: "",
    DL: "ja",
    ctl00$CPH1$btnKensaku: "検索/Search",
    PC: "1",
    PI: "0",
    IP: "on",
  });
  if (course.day !== null) params.set(`YB${course.day}`, "on");
  if (course.period !== null) params.set(`JG${course.period}`, "on");
  majorCodes.forEach((code, i) => params.set(`GB1B_${i}`, code));
  return `${SYLLABUS_ORIGIN}?${params}`;
}

function parseResults(html: string): Syllabus[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows = doc.querySelectorAll("#CPH1_gvw_kensaku tbody tr");
  const text = (row: Element, selector: string) =>
    row.querySelector(selector)?.textContent?.trim() ?? "";

  return Array.from(rows).flatMap((row) => {
    const href = row.querySelector(".col8 a")?.getAttribute("href");
    if (!href) return [];
    // 開講時限 cell: [campus] / day+period / (term)
    const spans = row.querySelectorAll(".col2 > span > span");
    const url = new URL(href, SYLLABUS_ORIGIN);
    if (url.origin !== new URL(SYLLABUS_ORIGIN).origin) return [];
    return {
      url: url.href,
      name: text(row, ".col3"),
      subject: text(row, ".col7"),
      campus: (spans[0]?.textContent ?? "").replace(/[[\]]/g, "").trim(),
      term: spans[2]?.textContent?.trim() ?? "",
      grade: text(row, ".col9"),
      credits: text(row, ".col6"),
      note: text(row, ".col10"),
    };
  });
}

async function search(url: string): Promise<Syllabus[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Syllabus search failed: ${res.status}`);
  return parseResults(await res.text());
}

async function searchCourse(course: Course, majorCodes: string[]): Promise<Syllabus[]> {
  let results = await search(buildSearchUrl(course, majorCodes, true));
  // The lecturer in Moodle may not match the syllabus spelling, so retry without it
  if (results.length === 0 && course.lecturer) {
    results = await search(buildSearchUrl(course, majorCodes, false));
  }
  const seen = new Set<string>();
  return results.filter((s) => !seen.has(s.url) && seen.add(s.url));
}

/**
 * Searches the syllabus site for every course held Monday to Saturday.
 * Skipped courses get no entry (so no icon); a failed search is saved as no result.
 */
export default async function fetchSyllabuses(
  courses: Course[],
  major: string,
): Promise<SyllabusMap> {
  const majorCodes = getMajorCodes(major);

  const map: SyllabusMap = {};
  for (const course of courses) {
    if (!hasSearchableDay(course)) continue;
    map[course.id] = [];
    try {
      map[course.id] = await searchCourse(course, majorCodes);
    } catch (e) {
      console.warn(`Syllabus search failed for ${course.title}:`, e);
    }
  }
  return map;
}
