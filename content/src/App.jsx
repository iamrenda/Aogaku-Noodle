/* global chrome */

import groupCoursesByDay from "../scripts/util/groupCoursesByDay";
import DAY_NAMES from "../scripts/const/dayNames";
import fetchCourses from "../scripts/extract/fetchCourses";
import CourseCard from "./sidepanel/components/CourseCard";
import "./App.css";
import { useState, useEffect } from "react";

/**
 * DaySection - Renders courses for a single day
 */
export function DaySection({ dayNumber, courses }) {
    if (!courses || courses.length === 0) return null;

    const dayName = dayNumber <= 6 ? DAY_NAMES[dayNumber] : dayNumber === 7 ? "特設コース" : "?";

    const isToday = dayNumber === new Date().getDay();

    return (
        <section className="day-section">
            <div className="day-section__header-container">
                <h3 className="day-section__header">{isToday ? `>> ${dayName} <<` : dayName}</h3>
            </div>
            <div className="course-grid">
                {courses.map((course, index) => (
                    <CourseCard key={`${dayNumber}-${index}`} course={course} />
                ))}
            </div>
        </section>
    );
}

/**
 * Main LMS Redesigner App
 *
 * Now receives courses directly from main.jsx after extraction
 */
export function LMSRedesignerApp() {
    const [grouped, setGrouped] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Extract courses when component mounts
    useEffect(() => {
        async function loadCourses() {
            try {
                // Use cached courses if available — avoid unnecessary API calls
                const stored = await new Promise((resolve) =>
                    chrome.storage.local.get(["courses"], resolve)
                );
                const cachedCourses = stored.courses;

                if (cachedCourses && cachedCourses.length > 0) {
                    const groupedByDay = groupCoursesByDay(cachedCourses);
                    setGrouped(groupedByDay);
                    setLoading(false);
                    return;
                }

                // No cached data — fetch from Moodle API
                const extractedCourses = await fetchCourses();

                if (!extractedCourses || extractedCourses.length === 0) {
                    setError("❌ No courses found or API returned empty.");
                    console.warn("No courses found");
                    return;
                }

                // Save to chrome storage for the side panel to access
                try {
                    chrome.storage.local.set({ courses: extractedCourses });
                } catch (e) {
                    console.warn("Could not save courses to storage:", e);
                }

                // Group by day
                const groupedByDay = groupCoursesByDay(extractedCourses);
                setGrouped(groupedByDay);
            } catch (err) {
                console.error("❌ Error loading courses:", err);
                setError(`Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }

        loadCourses();
    }, []);

    if (loading) {
        return (
            <div className="app loading">
                <div className="spinner"></div>
                <p>ローディング中...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="app error">
                <h2>予期しないエラーが発生しました</h2>
                <p>お手数ですが、開発者にエラーの詳細を報告してください。</p>
                <p>エラー内容: {error}</p>
                <p>
                    メール: <a href="mailto:iamrenda.dev@gmail.com">iamrenda.dev@gmail.com</a>
                </p>
            </div>
        );
    }

    // Success - Render organized courses
    return (
        <div className="app">
            {/* Header */}
            <header className="app__header">
                <h1 className="app__title">講義一覧</h1>
            </header>

            {/* Main content */}
            <main className="app__main">
                {/* Render each day */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <DaySection key={day} dayNumber={day} courses={grouped[day] || []} />
                ))}
            </main>

            {/* Footer info */}
            <footer className="app__footer">
                <p className="app__subtitle">created by iamrenda</p>
            </footer>
        </div>
    );
}

export default LMSRedesignerApp;
