import type { Course, RawCourse } from "../types/course";

const WEEKDAY_CHARS = "日月火水木金土";
const LECTURER_PART = /^\d+_\d+(.+)$/;
// (DAY)(PERIOD)限_(JAPANESE TITLE)_(ENGLISH TITLE) or (DAY)オンライン_...
const NAME_PREFIX = /^([日月火水木金土])(?:([1-8１-８])限|オンライン)_/;

function parseLecturer(idnumber: string | null): string | null {
  const names = idnumber
    ?.match(LECTURER_PART)?.[1]
    .split("/")
    .map((name) => name.trim())
    .filter(Boolean);

  return names && names.length > 0 ? names.join("、") : null;
}

/**
 * Parses fullname key-value into a Course object
 * Ex: "月3限_音楽理論I_Theory of Music I"
 * -> { day: 1, period: 3, title: "音楽理論I", isOnline: false }
 */
export default function parseCourse(raw: RawCourse): Course {
  const base = {
    id: raw.id,
    lecturer: parseLecturer(raw.idnumber),
    category: raw.coursecategory,
    link: raw.viewurl,
  };

  const match = raw.fullname.match(NAME_PREFIX);

  if (!match) {
    return {
      ...base,
      title: raw.fullname,
      day: null,
      period: null,
      isOnline: false,
    };
  }

  const [prefix, dayChar, periodChar] = match;

  return {
    ...base,
    title: raw.fullname.slice(prefix.length).split("_")[0],
    day: WEEKDAY_CHARS.indexOf(dayChar),
    period: periodChar ? Number(periodChar.normalize("NFKC")) : null,
    isOnline: periodChar === undefined,
  };
}
