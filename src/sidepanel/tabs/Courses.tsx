import DaySection from "../components/DaySection";
import RefreshPrompt from "../components/RefreshPrompt";
import useCourses from "../hooks/useCourses";
import groupCourses from "../utils/groupCourses";

export default function Courses() {
  const { courses, error, isRefreshing, refresh } = useCourses();
  const today = new Date().getDay();

  if (courses === null) return null;

  return (
    <div className="px-4 pt-2 pb-8">
      {courses.length === 0 ? (
        <RefreshPrompt error={error} isRefreshing={isRefreshing} onRefresh={refresh} />
      ) : (
        groupCourses(courses).map((section) => (
          <DaySection
            key={section.key}
            title={section.title}
            courses={section.courses}
            isToday={section.day === today}
          />
        ))
      )}
    </div>
  );
}
