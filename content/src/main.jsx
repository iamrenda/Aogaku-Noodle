import { createRoot } from "react-dom/client";
import { LMSRedesignerApp } from "./App";
import { DISPLAY_COUNT, INJECT_TO } from "../scripts/const/classNames";
import getClassesName from "../scripts/util/getClassesName";
import setDisplayAll from "../scripts/util/setDisplayAll";
import "../scripts/index.js";

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

// Target the element you want to "replace" or "attach to"
const { CONTAINER_CLASS } = getClassesName();

waitForElement(CONTAINER_CLASS, "my-redesign-root", async () => {
    // Step 1: Create React root
    const rootElement = document.createElement("div");
    rootElement.id = "my-redesign-root";

    const parent = document.querySelector(INJECT_TO);
    parent.insertAdjacentElement("beforebegin", rootElement);

    // Step 2. reload if display count is not "すべて"
    const counterEl = document.querySelector(DISPLAY_COUNT);
    if (counterEl && counterEl?.dataset.limit !== "0") {
        await setDisplayAll();
        return;
    }

    // Step 3: if successfull, hide original content
    const container = document.querySelector(INJECT_TO);
    if (container) {
        container.style.display = "none";
    }

    // Step 3: Render React component with courses
    const root = createRoot(rootElement);

    // Pass courses as props to the app
    root.render(<LMSRedesignerApp />);
});
