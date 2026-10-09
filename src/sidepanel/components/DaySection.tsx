import { DAYS_IN_JPN } from "../data/days";
import type { Course } from "../data/mock";
import CourseCard from "./CourseCard";

type Props = { dayNumber: number; courses: Course[]; isToday: boolean };

export default function DaySection({ dayNumber, courses, isToday }: Props) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="m-0 border-b border-rule pb-1.5 text-[15px] font-bold text-brand">
        {isToday && <span>&gt;&gt; </span>}
        {DAYS_IN_JPN[dayNumber]}
        {isToday && <span> &lt;&lt;</span>}
      </h2>
      <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
        {courses.map((c) => (
          <li key={c.period}>
            <CourseCard course={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
