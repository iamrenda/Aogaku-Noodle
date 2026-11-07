import type { Course } from "../types/course";
import CourseSelectItem from "./CourseSelectRow";

type Props = {
  title: string;
  courses: Course[];
  emptyMessage: string;
  included: Set<number>;
  onToggle: (id: number) => void;
};

export default function CourseSelectSection({
  title,
  courses,
  emptyMessage,
  included,
  onToggle,
}: Props) {
  return (
    <section className="mt-4">
      <h3 className="m-0 border-b border-rule pb-1 text-[13px] font-bold text-brand">{title}</h3>
      {courses.length === 0 ? (
        <p className="m-0 mt-2 text-[12px] text-ink-soft">{emptyMessage}</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {courses.map((course) => (
            <CourseSelectItem
              key={course.id}
              course={course}
              checked={included.has(course.id)}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
