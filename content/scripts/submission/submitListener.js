/* global chrome */

import { SUBMISSION_PENDING_KEY } from "./constants.js";
import { loadSubmissionStyles } from "./styles.js";
import { createToast } from "./toast.js";
import { createConfetti } from "./confetti.js";

function setSubmissionPending() {
    sessionStorage.setItem(SUBMISSION_PENDING_KEY, JSON.stringify({ timestamp: Date.now(), path: location.pathname }));
}

function getSubmissionPending() {
    try {
        const rawValue = sessionStorage.getItem(SUBMISSION_PENDING_KEY);
        if (!rawValue) return null;
        return JSON.parse(rawValue);
    } catch {
        return null;
    }
}

function clearSubmissionPending() {
    sessionStorage.removeItem(SUBMISSION_PENDING_KEY);
}

function isSubmissionButton(target) {
    return Boolean(
        target &&
        typeof target.closest === "function" &&
        (target.closest("#id_submitbutton") || target.closest('[data-action="save"]')),
    );
}

function hasSubmissionSuccessSignals() {
    const successSignalLinks = [
        "https://agulms45.aim.aoyama.ac.jp/mod/quiz/view.php",
        "https://agulms45.aim.aoyama.ac.jp/mod/assign/view.php",
    ];

    return successSignalLinks.some((link) => location.href.startsWith(link));
}

function showSubmissionSuccessFeedback() {
    chrome.storage.local.get(["showSubmissionFeedback"], (result) => {
        if (result.showSubmissionFeedback !== false) {
            loadSubmissionStyles();
            createToast();
            createConfetti();
        }
    });
}

export function monitorSubmissionSuccess() {
    const pendingSubmission = getSubmissionPending();
    if (!pendingSubmission) return;

    const startTime = Date.now();
    const timeoutMs = 10000;
    let observer;

    const clearAndStop = () => {
        clearSubmissionPending();
        if (observer) observer.disconnect();
    };

    const check = () => {
        if (!hasSubmissionSuccessSignals()) {
            if (Date.now() - startTime > timeoutMs) clearAndStop();
            return false;
        }

        clearAndStop();
        showSubmissionSuccessFeedback();
        return true;
    };

    if (check()) return;

    observer = new MutationObserver(() => {
        check();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

    window.setTimeout(() => {
        clearAndStop();
    }, timeoutMs);
}

export function bootstrapSubmissionFlow() {
    document.addEventListener(
        "click",
        (event) => {
            if (isSubmissionButton(event.target)) {
                setSubmissionPending();
            }
        },
        true,
    );

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", monitorSubmissionSuccess, { once: true });
    } else {
        monitorSubmissionSuccess();
    }
}

// CHECK: For testing purposes only
function runConfettiTestMode() {
    loadSubmissionStyles();
    createToast();
    createConfetti();
}

if (location.search.includes("confetti")) {
    runConfettiTestMode();
}
