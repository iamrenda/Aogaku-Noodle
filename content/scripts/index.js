import loadAssignmentsFromIframe from "./util/loadAssignmentsFromIframe";
import { bootstrapSubmissionFlow } from "./submission/submitListener.js";

async function refreshAssignments() {
    try {
        const assignments = await loadAssignmentsFromIframe();
        const lastUpdated = Date.now();
        chrome.storage.local.set({ assignments, lastUpdated });
    } catch (error) {
        console.warn("Failed to load assignments:", error);
    }
}

bootstrapSubmissionFlow();
void refreshAssignments();
