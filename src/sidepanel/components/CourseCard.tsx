import type { Course } from "../types/course";

export default function CourseCard({ course }: { course: Course }) {
  const periodLabel = course.isOnline ? "*" : course.period;

  return (
    <a
      href={course.link}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 rounded-xl border border-rule bg-white px-4 py-3.5 text-ink no-underline transition-colors hover:bg-wash focus-visible:bg-wash"
    >
      {periodLabel !== null && (
        <span className="w-8 shrink-0 text-center text-4xl leading-none font-normal text-num">{periodLabel}</span>
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-base leading-snug font-bold">{course.title}</span>
        {course.lecturer && <span className="text-[13px] text-ink-soft">{course.lecturer}</span>}
      </span>
    </a>
  );
}
