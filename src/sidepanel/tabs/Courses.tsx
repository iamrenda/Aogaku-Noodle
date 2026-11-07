import DaySection from "../components/DaySection";
import SyllabusNotice from "../components/SyllabusNotice";
import RefreshPrompt from "../components/RefreshPrompt";
import useCourses from "../hooks/useCourses";
import useCourseSelection from "../hooks/useCourseSelection";
import useMajor from "../hooks/useMajor";
import groupCourses from "../utils/groupCourses";

export default function Courses() {
  const { courses, error, isRefreshing, refresh } = useCourses();
  const { allCourses } = useCourseSelection();
  const { major } = useMajor();
  const today = new Date().getDay();

  if (courses === null || allCourses === null) return null;

  return (
    <div className="px-4 pt-2 pb-8">
      {courses.length === 0 && allCourses.length > 0 ? (
        // Everything was deselected; refreshing would reset the selection
        <p className="m-0 pt-4 text-[15px] leading-relaxed text-ink-soft">
          使用する講義が選択されていません。設定から選択してください。
        </p>
      ) : courses.length === 0 ? (
        <RefreshPrompt error={error} isRefreshing={isRefreshing} onRefresh={refresh} />
      ) : (
        <>
          {major === null && <SyllabusNotice />}
          {groupCourses(courses).map((section) => (
            <DaySection
              key={section.key}
              title={section.title}
              courses={section.courses}
              isToday={section.day === today}
            />
          ))}
        </>
      )}
    </div>
  );
}
