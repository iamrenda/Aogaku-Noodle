/* global chrome */

function updateBadge(assignments) {
    if (!assignments || !Array.isArray(assignments)) {
        chrome.action.setBadgeText({ text: "" });
        return;
    }
    const urgentCount = assignments.filter((assignment) => {
        return assignment.timestamp && assignment.timestamp * 1000 - Date.now() < 3 * 24 * 60 * 60 * 1000;
    }).length;

    if (urgentCount > 0) {
        chrome.action.setBadgeText({ text: urgentCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    } else {
        chrome.action.setBadgeText({ text: "" });
    }
}

// Initial update on startup
chrome.storage.local.get("assignments", (result) => {
    updateBadge(result.assignments);
});

// Listen for storage updates
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.assignments) {
        updateBadge(changes.assignments.newValue);
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message?.type !== "OPEN_GRADE_VIEWER") {
        return;
    }

    const grades = Array.isArray(message.grades) ? message.grades : [];

    chrome.storage.local.set(
        {
            gradeViewerData: grades,
            gradeViewerSourceUrl: sender?.tab?.url || message.sourceUrl || "",
            gradeViewerOpenedAt: Date.now(),
        },
        () => {
            chrome.windows.create(
                {
                    url: chrome.runtime.getURL("grade-viewer.html"),
                    type: "popup",
                    width: 1120,
                    height: 840,
                    focused: true,
                },
                () => {
                    void chrome.runtime.lastError;
                },
            );
        },
    );
});
