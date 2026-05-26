/* global chrome */

import fetchAssignments from "./extract/fetchAssignments.js";
import { bootstrapSubmissionFlow } from "./submission/submitListener.js";

export async function refreshAssignments() {
    try {
        const assignments = await fetchAssignments();
        const lastUpdated = Date.now();
        chrome.storage.local.set({ assignments, lastUpdated });
    } catch (error) {
        console.warn("Failed to load assignments:", error);
        alert("課題の読み込みに失敗しました。");
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "REFRESH_ASSIGNMENTS") {
        refreshAssignments();
    }
});

bootstrapSubmissionFlow();
