import useCourses from "../../sidepanel/hooks/useCourses";
import groupCourses from "../../sidepanel/utils/groupCourses";
import DayGrid from "./DayGrid";

/**
 * Course viewer injected into /my/courses.php
 * Shows the courses saved by the side panel; it never fetches on its own.
 */
export default function CourseViewer() {
  const { courses } = useCourses();
  const today = new Date().getDay();

  if (courses === null) return null;

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      {courses.length === 0 ? (
        <p className="m-0 text-sm text-ink-soft">
          講義がまだ保存されていません。サイドパネルから講義を読み込んでください。
        </p>
      ) : (
        groupCourses(courses).map((section) => (
          <DayGrid
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
