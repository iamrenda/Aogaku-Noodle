import type { Course } from "../data/mock";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <a
      href="#"
      className="flex items-center gap-4 rounded-xl border border-rule bg-white px-4 py-3.5 text-ink no-underline transition-colors hover:bg-wash focus-visible:bg-wash"
    >
      <span className="w-8 shrink-0 text-center text-4xl leading-none font-normal text-num">{course.period}</span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-base leading-snug font-bold">{course.title}</span>
        <span className="text-[13px] text-ink-soft">{course.lecturer}</span>
      </span>
    </a>
  );
}
