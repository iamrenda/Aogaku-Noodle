import DaySection from "../components/DaySection";
import { COURSES } from "../data/mock";

export default function Courses() {
  const today = new Date().getDay();

  return (
    <div className="px-4 pt-2 pb-8">
      {Object.entries(COURSES).map(([day, courses]) => (
        <DaySection key={day} dayNumber={Number(day)} courses={courses} isToday={Number(day) === today} />
      ))}
    </div>
  );
}
