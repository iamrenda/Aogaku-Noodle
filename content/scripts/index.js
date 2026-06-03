/* global chrome */

import fetchAssignments from "./extract/fetchAssignments.js";
import fetchCourses from "./extract/fetchCourses.js";
import { bootstrapSubmissionFlow } from "./submission/submitListener.js";

export async function refreshAssignments() {
    try {
        const assignments = await fetchAssignments();
        const lastUpdated = Date.now();
        chrome.storage.local.set({ assignments, lastUpdated });
    } catch (error) {
        console.warn("Failed to load assignments:", error);
        alert("課題の読み込みに失敗しました。再度更新してください。");
    }
}

export async function refreshCourses() {
    try {
        const courses = await fetchCourses();
        chrome.storage.local.set({ courses });
    } catch (error) {
        console.warn("Failed to load courses:", error);
        alert("講義の読み込みに失敗しました。再度更新してください。");
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "REFRESH_ASSIGNMENTS") {
        refreshAssignments();
    }
    if (message.type === "REFRESH_COURSES") {
        refreshCourses();
    }
});

bootstrapSubmissionFlow();
