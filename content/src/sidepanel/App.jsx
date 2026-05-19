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
    const [isLmsActive, setIsLmsActive] = useState(false);

    const triggerRefresh = () => {
        chrome.tabs.query({ url: "https://agulms45.aim.aoyama.ac.jp/*" }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "REFRESH_ASSIGNMENTS" });
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

        chrome.storage.session.get("hasRefreshedThisSession", (result) => {
            if (!result.hasRefreshedThisSession) {
                triggerRefresh();
                chrome.storage.session.set({ hasRefreshedThisSession: true });
            }
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
            chrome.tabs.onActivated.removeListener(checkActiveTab);
            chrome.tabs.onUpdated.removeListener(checkActiveTab);
        };
    }, []);

    return (
        <div className="sidepanel-container">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="tab-content">
                {activeTab === "assignments" && (
                    <Assignments assignments={assignments} loading={loading} lastUpdated={lastUpdated} onReload={triggerRefresh} canReload={isLmsActive} />
                )}
                {activeTab === "courses" && <Courses courses={courses} loading={loading} />}
                {activeTab === "settings" && <Settings />}
            </main>
        </div>
    );
}
