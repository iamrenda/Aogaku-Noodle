import CourseCard from "../../sidepanel/components/CourseCard";
import type { Course } from "../../sidepanel/types/course";

type Props = {
  title: string;
  courses: Course[];
  isToday: boolean;
};

export default function DayGrid({ title, courses, isToday }: Props) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="m-0 inline-block border-b-[3px] border-brand pb-2 text-2xl font-bold text-brand">
        {isToday && <span>&gt;&gt; </span>}
        {title}
        {isToday && <span> &lt;&lt;</span>}
      </h2>
      <ul className="m-0 mt-6 grid list-none grid-cols-2 gap-6 p-0 max-[780px]:grid-cols-1">
        {courses.map((c) => (
          <li key={c.id} className="grid min-w-0 grid-cols-1">
            <CourseCard course={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
