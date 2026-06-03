import { useState } from "react";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import SyllabusCard from "../components/SyllabusCard";
import fetchAllSyllabuses from "../../../scripts/syllabus/fetchAllSyllabuses";

function Syllabus({ loading, courses, syllabuses, selectedMajor }) {
    const [syllabusLoading, setSyllabusLoading] = useState(false);
    const [syllabusError, setSyllabusError] = useState(null);

    const handleFetchSyllabuses = async () => {
        if (!selectedMajor) return;
        setSyllabusLoading(true);
        setSyllabusError(null);
        try {
            await fetchAllSyllabuses();
        } catch (err) {
            setSyllabusError("シラバスの取得に失敗しました。");
            console.error(err);
        } finally {
            setSyllabusLoading(false);
        }
    };

    // Build a map from courseId → syllabus entry
    const syllabusMap = (syllabuses || []).reduce((acc, entry) => {
        acc[entry.courseId] = entry.syllabuses;
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="courses-list">
                <Loading />
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="courses-list">
                <EmptyState />
            </div>
        );
    }

    // Group courses by day — exclude special courses (day=7)
    const regularCourses = courses.filter((c) => c.day >= 0 && c.day <= 6);
    const groupedCourses = regularCourses.reduce((acc, course) => {
        if (!acc[course.day]) acc[course.day] = [];
        acc[course.day].push(course);
        return acc;
    }, {});

    const dayNames = {
        0: "日曜日",
        1: "月曜日",
        2: "火曜日",
        3: "水曜日",
        4: "木曜日",
        5: "金曜日",
        6: "土曜日",
        7: "特設コース",
    };

    const dayOrder = [1, 2, 3, 4, 5, 6, 0];
    const activeDays = dayOrder.filter((day) => groupedCourses[day] && groupedCourses[day].length > 0);

    const hasSyllabusData = syllabuses && syllabuses.length > 0;

    return (
        <div className="courses-list-grouped">
            <div className="syllabus-search-bar">
                <button
                    className="syllabus-search-btn"
                    onClick={handleFetchSyllabuses}
                    disabled={syllabusLoading || !selectedMajor}
                    title={!selectedMajor ? "設定から学科を選択してください" : undefined}
                    style={!selectedMajor ? { cursor: "not-allowed" } : undefined}
                >
                    {syllabusLoading ? "検索中…" : hasSyllabusData ? "再検索" : "シラバスを検索"}
                </button>
                {!selectedMajor && (
                    <span className="syllabus-search-hint">設定で学科を選択してください</span>
                )}
                {syllabusError && <span className="syllabus-search-error">{syllabusError}</span>}
            </div>

            {activeDays.map((day, dayIndex) => (
                <div key={day} className="day-section">
                    <h2 className="day-header">{dayNames[day]}</h2>
                    <div className="day-courses">
                        {groupedCourses[day].map((course, index) => {
                            // null means data not yet fetched; [] means fetched but no hits
                            const syllabusList = hasSyllabusData
                                ? (syllabusMap[course.id] ?? null)
                                : null;
                            return (
                                <SyllabusCard
                                    key={index}
                                    course={course}
                                    syllabusList={syllabusList}
                                    dayIndex={dayIndex}
                                    index={index}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Syllabus;
