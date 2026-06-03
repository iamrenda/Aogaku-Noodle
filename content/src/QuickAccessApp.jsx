/* global chrome */
import { useState, useEffect } from "react";
import CourseCard from "./sidepanel/components/CourseCard";
import Assignments from "./sidepanel/tabs/Assignments";
import groupCoursesByDay from "../scripts/util/groupCoursesByDay";
import { refreshAssignments, refreshCourses } from "../scripts/index.js";
import getTimeAgo from "./sidepanel/util/getTimeAgo.js";

export function QuickAccessApp() {
    const [todayCourses, setTodayCourses] = useState([]);
    const [hasAnyCourses, setHasAnyCourses] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingCourses, setFetchingCourses] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isReloading, setIsReloading] = useState(false);
    const [, setTick] = useState(0);

    useEffect(() => {
        setIsReloading(false); // Clear reloading state when data actually updates
        if (!lastUpdated) return;
        const timer = setInterval(() => {
            setTick((t) => t + 1);
        }, 30000); // Update every 30 seconds to be responsive
        return () => clearInterval(timer);
    }, [lastUpdated]);

    useEffect(() => {
        chrome.storage.local.get(["courses", "assignments", "lastUpdated"], (result) => {
            const courses = result.courses || [];
            setHasAnyCourses(courses.length > 0);
            if (courses.length > 0) {
                const today = new Date().getDay();
                const grouped = groupCoursesByDay(courses);
                setTodayCourses(grouped[today] || []);
            }
            if (result.assignments) {
                // sort by nearest deadline first
                const sorted = [...result.assignments].sort((a, b) => a.timestamp - b.timestamp);
                setAssignments(sorted);
            }
            if (result.lastUpdated) {
                setLastUpdated(result.lastUpdated);
            }
            setLoading(false);
        });

        const listener = (changes, namespace) => {
            if (namespace === "local") {
                if (changes.courses) {
                    const courses = changes.courses.newValue || [];
                    setHasAnyCourses(courses.length > 0);
                    setFetchingCourses(false);
                    const today = new Date().getDay();
                    const grouped = groupCoursesByDay(courses);
                    setTodayCourses(grouped[today] || []);
                }
                if (changes.assignments) {
                    const sorted = [...(changes.assignments.newValue || [])].sort((a, b) => a.timestamp - b.timestamp);
                    setAssignments(sorted);
                }
                if (changes.lastUpdated) {
                    setLastUpdated(changes.lastUpdated.newValue);
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

    const handleReload = () => {
        setIsReloading(true);
        refreshAssignments();
        setTimeout(() => setIsReloading(false), 5000);
    };

    const handleFetchCourses = () => {
        setFetchingCourses(true);
        refreshCourses();
    };

    return (
        <section className="quick-access" id="quick-access">
            <h2 className="quick-access__title">クイックアクセス</h2>

            <div className="quick-access__section">
                <h3 className="quick-access__subtitle">今日の講義</h3>
                {!hasAnyCourses ? (
                    <div className="quick-access__empty-courses">
                        <p className="empty-message">講義データがありません</p>
                        <button
                            className="quick-access__fetch-btn"
                            onClick={handleFetchCourses}
                            disabled={fetchingCourses}
                        >
                            {fetchingCourses ? "読み込み中…" : "講義を読み込む"}
                        </button>
                    </div>
                ) : todayCourses.length > 0 ? (
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
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 className="quick-access__subtitle" style={{ margin: 0 }}>
                        直近の課題
                    </h3>
                    {!loading && lastUpdated && (
                        <div
                            className="last-updated"
                            style={{
                                fontSize: "0.8rem",
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <button
                                className={`reload-button ${isReloading ? "loading" : ""}`}
                                onClick={handleReload}
                                disabled={isReloading}
                            >
                                {isReloading && <span className="spinner-icon"></span>}
                                {isReloading ? "ローディング中..." : "更新する"}
                            </button>
                            <span>最終更新: {getTimeAgo(lastUpdated)}</span>
                        </div>
                    )}
                </div>
                <div className="quick-access__list grid-layout">
                    <Assignments assignments={assignments} loading={loading} hideHeader={true} />
                </div>
            </div>
        </section>
    );
}
