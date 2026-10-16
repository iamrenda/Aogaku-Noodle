import { useState } from "react";
import { MdDescription } from "react-icons/md";
import useMajor from "../hooks/useMajor";
import useSyllabuses from "../hooks/useSyllabuses";
import type { Course } from "../types/course";
import type { Syllabus } from "../types/syllabus";
import SyllabusPicker from "./SyllabusPicker";

export default function CourseCard({ course }: { course: Course }) {
  const periodLabel = course.isOnline ? "*" : course.period;
  const { syllabuses, choose } = useSyllabuses(course.id);
  const { major } = useMajor();
  // undefined syllabuses = not searched yet, so no icon
  const showSyllabus = typeof major === "string" && course.day !== null && syllabuses !== undefined;
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const matchCount = syllabuses?.length ?? 0;
  const syllabusLabel =
    matchCount === 0
      ? "シラバスが見つかりません"
      : matchCount === 1
        ? "シラバスを開く"
        : "シラバスを選択";

  const openSyllabus = () => {
    if (matchCount === 1) window.open(syllabuses![0].url, "_blank", "noopener");
    else if (matchCount > 1) setIsPickerOpen(true);
  };

  const selectSyllabus = async (syllabus: Syllabus) => {
    await choose(syllabus);
    setIsPickerOpen(false);
    window.open(syllabus.url, "_blank", "noopener");
  };

  return (
    // The title link is stretched over the whole card; the syllabus button sits above it.
    // `isolate` keeps those z-indexes inside the card so they never rise above the sticky tab bar.
    <>
      <div className="relative isolate flex min-w-0 flex-col items-start gap-2 rounded-xl border border-rule bg-white px-4 py-3.5 text-ink shadow-md shadow-ink/10 transition-colors hover:bg-wash focus-within:bg-wash">
        {(periodLabel !== null || showSyllabus) && (
          <div className="flex w-full items-start justify-between gap-3">
            {periodLabel !== null ? (
              <span className="text-4xl leading-none font-normal text-num">{periodLabel}</span>
            ) : (
              <span />
            )}
            {showSyllabus && (
              <button
                type="button"
                onClick={openSyllabus}
                disabled={matchCount === 0}
                aria-label={syllabusLabel}
                title={syllabusLabel}
                className={`relative z-10 flex cursor-pointer items-center rounded-md border-0 bg-transparent p-0.5 disabled:cursor-default ${
                  matchCount > 1
                    ? "text-alert"
                    : matchCount === 1
                      ? "text-brand"
                      : "text-ink-soft/40"
                }`}
              >
                <MdDescription size={24} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <span className="flex w-full min-w-0 flex-col gap-1">
          <a
            href={course.link}
            target="_blank"
            rel="noreferrer"
            title={course.title}
            className="line-clamp-2 text-lg leading-snug font-bold text-ink no-underline after:absolute after:inset-0 after:content-['']"
          >
            {course.title}
          </a>
          {course.lecturer && (
            <span className="truncate text-[13px] text-ink-soft" title={course.lecturer}>
              {course.lecturer}
            </span>
          )}
        </span>
      </div>
      {/* Outside the isolated card so the picker can rise above the sticky tab bar */}
      {isPickerOpen && syllabuses && (
        <SyllabusPicker
          syllabuses={syllabuses}
          onSelect={selectSyllabus}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </>
  );
}
