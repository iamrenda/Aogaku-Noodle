/* global chrome */
import { useState, useEffect } from "react";
import CourseCard from "./CourseCard";
import Assignments from "./sidepanel/tabs/Assignments";
import groupCoursesByDay from "../scripts/util/groupCoursesByDay";

export function QuickAccessApp() {
    const [todayCourses, setTodayCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        chrome.storage.local.get(["courses", "assignments"], (result) => {
            if (result.courses) {
                const today = new Date().getDay();
                const grouped = groupCoursesByDay(result.courses);
                setTodayCourses(grouped[today] || []);
            }
            if (result.assignments) {
                // sort by nearest deadline first
                const sorted = [...result.assignments].sort((a, b) => a.timestamp - b.timestamp);
                setAssignments(sorted);
            }
            setLoading(false);
        });

        const listener = (changes, namespace) => {
            if (namespace === "local") {
                if (changes.courses) {
                    const today = new Date().getDay();
                    const grouped = groupCoursesByDay(changes.courses.newValue || []);
                    setTodayCourses(grouped[today] || []);
                }
                if (changes.assignments) {
                    const sorted = [...(changes.assignments.newValue || [])].sort((a, b) => a.timestamp - b.timestamp);
                    setAssignments(sorted);
                }
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, []);

    if (loading) {
        return null;
    }

    return (
        <section className="quick-access" id="quick-access">
            <h2 className="quick-access__title">クイックアクセス</h2>

            <div className="quick-access__section">
                <h3 className="quick-access__subtitle">今日の講義</h3>
                {todayCourses.length > 0 ? (
                    <div className="quick-access__list grid-layout">
                        {todayCourses.map((course, index) => (
                            <CourseCard key={`today-${index}`} course={course} />
                        ))}
                    </div>
                ) : (
                    <p className="empty-message">今日の講義はありません</p>
                )}
            </div>

            <div className="quick-access__section">
                <h3 className="quick-access__subtitle">直近の課題</h3>
                <div className="quick-access__list grid-layout">
                    <Assignments assignments={assignments} loading={loading} />
                </div>
            </div>
        </section>
    );
}
