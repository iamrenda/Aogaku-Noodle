/* global chrome */
import { useState, useEffect } from "react";
import CourseCard from "./sidepanel/components/CourseCard";
import Assignments from "./sidepanel/tabs/Assignments";
import groupCoursesByDay from "../scripts/util/groupCoursesByDay";
import { refreshAssignments, refreshCourses } from "../scripts/index.js";
import getTimeAgo from "./sidepanel/util/getTimeAgo.js";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export function QuickAccessApp() {
    const [todayCourses, setTodayCourses] = useState([]);
    const [hasAnyCourses, setHasAnyCourses] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingCourses, setFetchingCourses] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isReloading, setIsReloading] = useState(false);
    const [, setTick] = useState(0);
    const [hiddenIds, setHiddenIds] = useState(new Set());
    const [showHidden, setShowHidden] = useState(false);

    useEffect(() => {
        setIsReloading(false); // Clear reloading state when data actually updates
        if (!lastUpdated) return;
        const timer = setInterval(() => {
            setTick((t) => t + 1);
        }, 30000); // Update every 30 seconds to be responsive
        return () => clearInterval(timer);
    }, [lastUpdated]);

    // Load persisted hidden IDs
    useEffect(() => {
        chrome.storage.local.get(["hiddenAssignments"], (result) => {
            if (result.hiddenAssignments) setHiddenIds(new Set(result.hiddenAssignments));
        });
        const listener = (changes, namespace) => {
            if (namespace === "local" && changes.hiddenAssignments) {
                setHiddenIds(new Set(changes.hiddenAssignments.newValue || []));
            }
        };
        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, []);

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
                const sorted = [...result.assignments].sort((a, b) => a.dueDate - b.dueDate);
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
                    const sorted = [...(changes.assignments.newValue || [])].sort((a, b) => a.dueDate - b.dueDate);
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

    const handleHide = (id) => {
        setHiddenIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            chrome.storage.local.set({ hiddenAssignments: [...next] });
            return next;
        });
    };

    const handleShow = (id) => {
        setHiddenIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            chrome.storage.local.set({ hiddenAssignments: [...next] });
            return next;
        });
    };

    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const urgentAssignments = assignments.filter(
        (a) => a.isOverdue || (a.dueDate && a.dueDate * 1000 <= now + threeDaysMs),
    );

    const hiddenCount = urgentAssignments.filter((a) => hiddenIds.has(a.id)).length;

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
                        直近の課題 (3日以内)
                    </h3>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {urgentAssignments.length > 0 && hiddenCount > 0 && (
                            <a
                                className="assignments-hidden-toggle"
                                href="#"
                                title={showHidden ? "非表示の課題を隠す" : `非表示の課題を表示する（${hiddenCount}件）`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowHidden((v) => !v);
                                }}
                            >
                                {showHidden ? (
                                    <>
                                        <MdVisibilityOff size={15} />
                                        <span>{hiddenCount}件</span>
                                    </>
                                ) : (
                                    <>
                                        <MdVisibility size={15} />
                                        <span>{hiddenCount}件</span>
                                    </>
                                )}
                            </a>
                        )}
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
                </div>
                {assignments.length === 0 ? (
                    <div className="quick-access__empty-courses">
                        <p className="empty-message">課題データがありません</p>
                        <button className="quick-access__fetch-btn" onClick={handleReload} disabled={isReloading}>
                            {isReloading ? "読み込み中…" : "課題を読み込む"}
                        </button>
                    </div>
                ) : urgentAssignments.length === 0 ? (
                    <p className="empty-message">直近3日以内の課題はありません 🎉</p>
                ) : (
                    <div className="quick-access__list grid-layout">
                        <Assignments
                            assignments={urgentAssignments}
                            loading={loading}
                            hideHeader={true}
                            hideToggle={true}
                            hiddenIdsExternal={hiddenIds}
                            showHiddenExternal={showHidden}
                            onHideExternal={handleHide}
                            onShowExternal={handleShow}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
