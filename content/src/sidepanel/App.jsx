/* global chrome */

import Assignments from "./tabs/Assignments";
import Courses from "./tabs/Courses";
import Syllabus from "./tabs/Syllabus";
import Settings from "./tabs/Settings";
import Tabs from "./tabs/Tabs";
import { useState, useEffect } from "react";

export function SidePanelApp() {
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [syllabuses, setSyllabuses] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLmsActive, setIsLmsActive] = useState(false);

    const triggerRefresh = () => {
        chrome.tabs.query({ url: "https://agulms45.aim.aoyama.ac.jp/*" }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "REFRESH_ASSIGNMENTS" });
            }
        });
    };

    const triggerFetchCourses = () => {
        chrome.tabs.query({ url: "https://agulms45.aim.aoyama.ac.jp/*" }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "REFRESH_COURSES" });
            }
        });
    };

    useEffect(() => {
        const checkActiveTab = async () => {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0 && tabs[0].url?.startsWith("https://agulms45.aim.aoyama.ac.jp/")) {
                setIsLmsActive(true);
            } else {
                setIsLmsActive(false);
            }
        };

        checkActiveTab();

        chrome.tabs.onActivated.addListener(checkActiveTab);
        chrome.tabs.onUpdated.addListener(checkActiveTab);

        // Initial fetch
        chrome.storage.local.get(["assignments", "courses", "syllabuses", "selectedMajor", "defaultTab", "lastUpdated"], (result) => {
            if (result.assignments) {
                const sorted = [...result.assignments].sort((a, b) => a.dueDate - b.dueDate);
                setAssignments(sorted);
            }
            if (result.courses) {
                setCourses(result.courses);
            }
            if (result.syllabuses) {
                setSyllabuses(result.syllabuses);
            }
            if (result.selectedMajor) {
                setSelectedMajor(result.selectedMajor);
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
                    const sorted = [...(changes.assignments.newValue || [])].sort((a, b) => a.dueDate - b.dueDate);
                    setAssignments(sorted);
                }
                if (changes.courses) {
                    setCourses(changes.courses.newValue || []);
                }
                if (changes.syllabuses) {
                    setSyllabuses(changes.syllabuses.newValue || []);
                }
                if (changes.selectedMajor) {
                    setSelectedMajor(changes.selectedMajor.newValue || null);
                }
                if (changes.lastUpdated) {
                    setLastUpdated(changes.lastUpdated.newValue || null);
                }
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => {
            chrome.storage.onChanged.removeListener(listener);
            chrome.tabs.onActivated.removeListener(checkActiveTab);
            chrome.tabs.onUpdated.removeListener(checkActiveTab);
        };
    }, []);

    return (
        <div className="sidepanel-container">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="tab-content">
                {activeTab === "assignments" && (
                    <Assignments
                        assignments={assignments}
                        loading={loading}
                        lastUpdated={lastUpdated}
                        onReload={triggerRefresh}
                        canReload={isLmsActive}
                        isLmsActive={isLmsActive}
                    />
                )}
                {activeTab === "courses" && <Courses courses={courses} loading={loading} isLmsActive={isLmsActive} onFetchCourses={triggerFetchCourses} />}
                {activeTab === "syllabus" && <Syllabus courses={courses} syllabuses={syllabuses} selectedMajor={selectedMajor} loading={loading} />}
                {activeTab === "settings" && <Settings />}
            </main>
        </div>
    );
}
