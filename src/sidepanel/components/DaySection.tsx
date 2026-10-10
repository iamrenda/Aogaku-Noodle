import type { Course } from "../types/course";
import CourseCard from "./CourseCard";

type Props = {
  title: string;
  courses: Course[];
  isToday: boolean;
};

export default function DaySection({ title, courses, isToday }: Props) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="m-0 border-b border-rule pb-1.5 text-[15px] font-bold text-brand">
        {isToday && <span>&gt;&gt; </span>}
        {title}
        {isToday && <span> &lt;&lt;</span>}
      </h2>
      <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
        {courses.map((c) => (
          <li key={c.id}>
            <CourseCard course={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
