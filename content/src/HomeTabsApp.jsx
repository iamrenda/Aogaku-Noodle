/* global chrome */
import { useState, useEffect } from "react";
import { MdMenuBook, MdAssignment, MdVisibility, MdVisibilityOff, MdAdd } from "react-icons/md";
import { DaySection } from "./App";
import groupCoursesByDay from "../scripts/util/groupCoursesByDay";
import { refreshAssignments } from "../scripts/index.js";
import getTimeAgo from "./sidepanel/util/getTimeAgo.js";
import activeCustomAssignments from "./sidepanel/util/activeCustomAssignments.js";
import AssignmentCard from "./sidepanel/components/AssignmentCard";
import AddAssignmentModal from "./sidepanel/components/AddAssignmentModal";
import "./HomeTabsApp.css";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * Group assignments by their due *date* (ignoring time of day), sorted with the
 * nearest/overdue date first — mirroring how the courses tab groups by day.
 */
function groupAssignmentsByDate(list) {
    const groups = new Map();

    for (const assignment of list) {
        let key, sortTs, label;

        if (!assignment.dueDate) {
            key = "未定";
            sortTs = Infinity;
            label = "未定";
        } else {
            const d = new Date(assignment.dueDate * 1000);
            key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            sortTs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            label = `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`;
        }

        if (!groups.has(key)) groups.set(key, { key, sortTs, label, items: [] });
        groups.get(key).items.push(assignment);
    }

    return [...groups.values()]
        .sort((a, b) => a.sortTs - b.sortTs)
        .map((g) => ({ ...g, items: g.items.sort((a, b) => a.dueDate - b.dueDate) }));
}

/**
 * Home page section with two tabs:
 *   - 講義: courses grouped by day (same layout as LMSRedesignerApp)
 *   - 課題: visible assignments grouped by due date (nearest/overdue first)
 */
export function HomeTabsApp() {
    const [activeTab, setActiveTab] = useState("courses");
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [customAssignments, setCustomAssignments] = useState([]);
    const [hiddenIds, setHiddenIds] = useState(new Set());
    const [showHidden, setShowHidden] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isReloading, setIsReloading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [, setTick] = useState(0);

    useEffect(() => {
        chrome.storage.local.get(
            ["courses", "assignments", "customAssignments", "hiddenAssignments", "lastUpdated"],
            (result) => {
                setCourses(result.courses || []);
                setAssignments(result.assignments || []);
                setCustomAssignments(result.customAssignments || []);
                if (result.hiddenAssignments) setHiddenIds(new Set(result.hiddenAssignments));
                if (result.lastUpdated) setLastUpdated(result.lastUpdated);
                setLoading(false);
            },
        );

        const listener = (changes, namespace) => {
            if (namespace !== "local") return;
            if (changes.courses) setCourses(changes.courses.newValue || []);
            if (changes.assignments) setAssignments(changes.assignments.newValue || []);
            if (changes.customAssignments) setCustomAssignments(changes.customAssignments.newValue || []);
            if (changes.hiddenAssignments) setHiddenIds(new Set(changes.hiddenAssignments.newValue || []));
            if (changes.lastUpdated) setLastUpdated(changes.lastUpdated.newValue);
        };
        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, []);

    // Clear the reloading state when fresh data arrives, and keep the relative
    // "last updated" label fresh.
    useEffect(() => {
        setIsReloading(false);
        if (!lastUpdated) return;
        const timer = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(timer);
    }, [lastUpdated]);

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

    const handleReload = () => {
        setIsReloading(true);
        refreshAssignments();
        setTimeout(() => setIsReloading(false), 5000);
    };

    const handleComplete = (id) => {
        chrome.storage.local.get(["customAssignments"], (result) => {
            const list = (result.customAssignments || []).map((c) =>
                c.id === id ? { ...c, completed: true } : c,
            );
            chrome.storage.local.set({ customAssignments: list });
        });
    };

    if (loading) return null;

    const grouped = groupCoursesByDay(courses);

    const allAssignments = [...assignments, ...activeCustomAssignments(customAssignments)];
    const visibleAssignments = allAssignments.filter((a) => !hiddenIds.has(a.id));
    const hiddenCount = allAssignments.length - visibleAssignments.length;
    const displayedAssignments = showHidden ? assignments : visibleAssignments;
    const assignmentGroups = groupAssignmentsByDate(displayedAssignments);
    let cardIndex = 0;

    return (
        <section className="home-tabs">
            <div className="home-tabs__nav">
                <button
                    className={`home-tabs__tab ${activeTab === "courses" ? "home-tabs__tab--active" : ""}`}
                    onClick={() => setActiveTab("courses")}
                >
                    <MdMenuBook size={18} />
                    <span>講義</span>
                </button>
                <button
                    className={`home-tabs__tab ${activeTab === "assignments" ? "home-tabs__tab--active" : ""}`}
                    onClick={() => setActiveTab("assignments")}
                >
                    <MdAssignment size={18} />
                    <span>課題</span>
                </button>
            </div>

            {activeTab === "courses" && (
                <div className="home-tabs__panel">
                    {courses.length === 0 ? (
                        <p className="empty-message">講義データがありません</p>
                    ) : (
                        [0, 1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <DaySection key={day} dayNumber={day} courses={grouped[day] || []} />
                        ))
                    )}
                </div>
            )}

            {activeTab === "assignments" && (
                <div className="home-tabs__panel">
                    <div className="home-tabs__toolbar">
                        <button
                            className="home-tabs__add-btn"
                            onClick={() => setShowAddModal(true)}
                            title="課題を追加"
                        >
                            <MdAdd size={16} />
                            <span>課題を追加</span>
                        </button>
                        {hiddenCount > 0 && (
                            <a
                                className="assignments-hidden-toggle"
                                href="#"
                                title={showHidden ? "非表示の課題を隠す" : `非表示の課題を表示する（${hiddenCount}件）`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowHidden((v) => !v);
                                }}
                            >
                                {showHidden ? <MdVisibilityOff size={15} /> : <MdVisibility size={15} />}
                                <span>{hiddenCount}件</span>
                            </a>
                        )}
                        {lastUpdated && (
                            <div className="home-tabs__last-updated">
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

                    {allAssignments.length === 0 ? (
                        <p className="empty-message">課題データがありません</p>
                    ) : (
                        assignmentGroups.map((group) => (
                            <section key={group.key} className="day-section">
                                <div className="day-section__header-container">
                                    <h3 className="day-section__header">{group.label}</h3>
                                </div>
                                <div className="home-tabs__assignment-grid">
                                    {group.items.map((assignment) => {
                                        const index = cardIndex++;
                                        return (
                                            <AssignmentCard
                                                key={assignment.id ?? index}
                                                assignment={assignment}
                                                index={index}
                                                isHidden={hiddenIds.has(assignment.id)}
                                                onHide={handleHide}
                                                onShow={handleShow}
                                                onComplete={handleComplete}
                                            />
                                        );
                                    })}
                                </div>
                            </section>
                        ))
                    )}
                </div>
            )}

            {showAddModal && <AddAssignmentModal onClose={() => setShowAddModal(false)} />}
        </section>
    );
}

export default HomeTabsApp;
