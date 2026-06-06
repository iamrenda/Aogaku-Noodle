/* global chrome */
import scrapeGradeRows from "./scrapeGrades";
import initGradeViewerOverlay from "../../src/grade-viewer/page/overlay";

chrome.storage.local.get(["extensionEnabled", "gradeViewerEnabled"], (result) => {
    const extensionEnabled = result.extensionEnabled !== false;
    const gradeViewerEnabled = result.gradeViewerEnabled !== false;

    if (!extensionEnabled || !gradeViewerEnabled) return;

    initGradeViewerOverlay({ scrapeGradeRows });
});
