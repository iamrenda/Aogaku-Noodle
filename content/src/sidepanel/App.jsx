/* global chrome */

import Assignments from "./tabs/Assignments";
import Courses from "./tabs/Courses";
import Settings from "./tabs/Settings";
import Tabs from "./tabs/Tabs";
import { useState, useEffect } from "react";

export function SidePanelApp() {
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        // Initial fetch
        chrome.storage.local.get(["assignments", "courses", "defaultTab", "lastUpdated"], (result) => {
            if (result.assignments) {
                setAssignments(result.assignments);
            }
            if (result.courses) {
                setCourses(result.courses);
            }
            if (result.defaultTab) {
                setActiveTab(result.defaultTab);
            } else {
                setActiveTab("courses");
            }
            if (result.lastUpdated) {
                setLastUpdated(result.lastUpdated);
            }
            setLoading(false);
        });

        // Listen for updates from the content script
        const listener = (changes, namespace) => {
            if (namespace === "local") {
                if (changes.assignments) {
                    setAssignments(changes.assignments.newValue || []);
                }
                if (changes.courses) {
                    setCourses(changes.courses.newValue || []);
                }
                if (changes.lastUpdated) {
                    setLastUpdated(changes.lastUpdated.newValue || null);
                }
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, []);

    return (
        <div className="sidepanel-container">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="tab-content">
                {activeTab === "assignments" && (
                    <Assignments assignments={assignments} loading={loading} lastUpdated={lastUpdated} />
                )}
                {activeTab === "courses" && <Courses courses={courses} loading={loading} />}
                {activeTab === "settings" && <Settings />}
            </main>
        </div>
    );
}
