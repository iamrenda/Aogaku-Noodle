import type { Course } from "../types/course";

type Props = {
  course: Course;
  checked: boolean;
  onToggle: (id: number) => void;
};

export default function CourseSelectItem({ course, checked, onToggle }: Props) {
  return (
    <li className="border-b border-rule last:border-b-0">
      <label className="flex cursor-pointer items-start gap-3 px-1 py-2.5 hover:bg-wash">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(course.id)}
          className="mt-1 size-4 shrink-0 cursor-pointer accent-brand"
        />
        <span className="flex min-w-0 flex-col">
          <span className="text-[14px] leading-snug text-ink">{course.title}</span>
          {course.lecturer && (
            <span className="truncate text-[12px] text-ink-soft">{course.lecturer}</span>
          )}
        </span>
      </label>
    </li>
  );
}
