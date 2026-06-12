/* global chrome */
import { createRoot } from "react-dom/client";
import { LMSRedesignerApp } from "./App";
import { QuickAccessApp } from "./QuickAccessApp";
import { HomeTabsApp } from "./HomeTabsApp";
import { INJECT_TO } from "../scripts/const/classNames";
import "../scripts/index.js";
import { refreshAssignments } from "../scripts/index.js";

/**
 * Wait for an element to appear in DOM
 * Used to wait for LMS to load
 */
function waitForElement(selector, rootId, callback) {
    const check = () => {
        // 1. Check if we already injected the app to prevent infinite loops
        if (document.getElementById(rootId)) return true;

        const el = document.querySelector(selector);
        // 2. Ensure target exists
        if (el) {
            if (selector === "#site-news-forum" || el.innerText.trim().length > 0) {
                callback(el);
                return true;
            }
        }
        return false;
    };

    if (check()) return;

    const observer = new MutationObserver(() => {
        if (check()) {
            observer.disconnect(); // 3. Stop watching immediately
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

function injectLMSRedesigner() {
    const isCoursesPage = window.location.href.startsWith("https://agulms45.aim.aoyama.ac.jp/my/courses.php");
    if (!isCoursesPage || document.getElementById("my-redesign-root")) return;

    const rootElement = document.createElement("div");
    rootElement.id = "my-redesign-root";

    const parent = document.querySelector(INJECT_TO);
    if (parent) {
        parent.insertAdjacentElement("beforebegin", rootElement);
        parent.style.display = "none";
    }

    createRoot(rootElement).render(<LMSRedesignerApp />);
}

function injectQuickAccess() {
    const url = window.location.href;
    const isHomePage = url.startsWith("https://agulms45.aim.aoyama.ac.jp/?redirect=0");

    if (!isHomePage) return;

    refreshAssignments();

    waitForElement("#site-news-forum", "quick-access-root", (el) => {
        if (document.getElementById("quick-access-root")) return;

        const rootElement = document.createElement("div");
        rootElement.id = "quick-access-root";

        el.insertAdjacentElement("beforebegin", rootElement);

        const root = createRoot(rootElement);
        root.render(<QuickAccessApp />);

        if (!document.getElementById("home-tabs-root")) {
            const homeTabsRoot = document.createElement("div");
            homeTabsRoot.id = "home-tabs-root";
            rootElement.insertAdjacentElement("afterend", homeTabsRoot);
            createRoot(homeTabsRoot).render(<HomeTabsApp />);
        }
    });
}

chrome.storage.local.get(["extensionEnabled", "lmsRedesignEnabled", "quickAccessEnabled"], (result) => {
    const extensionEnabled = result.extensionEnabled !== false;
    if (!extensionEnabled) return;

    const lmsRedesignEnabled = result.lmsRedesignEnabled !== false;
    if (lmsRedesignEnabled) injectLMSRedesigner();

    const quickAccessEnabled = result.quickAccessEnabled !== false;
    if (quickAccessEnabled) injectQuickAccess();
});
