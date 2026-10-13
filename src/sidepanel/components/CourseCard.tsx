import type { Course } from "../types/course";

export default function CourseCard({ course }: { course: Course }) {
  const periodLabel = course.isOnline ? "*" : course.period;

  return (
    <a
      href={course.link}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 flex-col items-start gap-2 rounded-xl border border-rule bg-white px-4 py-3.5 shadow-md shadow-ink/10 text-ink no-underline transition-colors hover:bg-wash focus-visible:bg-wash"
    >
      {periodLabel !== null && (
        <span className="text-4xl leading-none font-normal text-num">{periodLabel}</span>
      )}
      <span className="flex w-full min-w-0 flex-col gap-1">
        <span className="line-clamp-2 text-lg leading-snug font-bold" title={course.title}>
          {course.title}
        </span>
        {course.lecturer && (
          <span className="truncate text-[13px] text-ink-soft" title={course.lecturer}>
            {course.lecturer}
          </span>
        )}
      </span>
    </a>
  );
}
