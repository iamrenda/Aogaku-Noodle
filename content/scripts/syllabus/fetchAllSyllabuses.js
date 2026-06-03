/* global chrome */

import { faculties, GENERAL_MAJOR_CODE } from "../../src/sidepanel/components/MajorPicker.jsx";

const DAY_NAMES = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

function getMajorCodes(majorLabel) {
    for (const facultyItem of faculties) {
        for (const major of facultyItem.majors) {
            if (major.label === majorLabel) {
                return [...major.code, GENERAL_MAJOR_CODE];
            }
        }
    }
    return [GENERAL_MAJOR_CODE];
}

function buildSyllabusSearchUrl(course, majorCodes) {
    const year = new Date().getFullYear();

    const params = new URLSearchParams({
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATEGENERATOR: "309A73F1",
        YR: year.toString(),
        BU: "BU1",
        KW: "",
        KM: course.trimmedTitle || "",
        KI: course.lecturer || "",
        GKB: "",
        DL: "ja",
        ctl00$CPH1$btnKensaku: "検索/Search",
        PC: "1",
        PI: "0",
        IP: "on",
    });

    if (course.day >= 1 && course.day <= 6) {
        params.set(`YB${course.day}`, "on");
    }

    if (course.period && course.period >= 1) {
        const fullWidthPeriod = String.fromCharCode(0xff10 + course.period);
        const periodNumber = String.fromCharCode(fullWidthPeriod.charCodeAt(0) - 0xff10 + 0x30);
        params.set(`JG${periodNumber}`, "on");
    }

    majorCodes.forEach((code, index) => params.set(`GB1B_${index}`, code));

    return `https://syllabus.aoyama.ac.jp/?${params.toString()}`;
}

function fetchSyllabusHtml(url) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "FETCH_SYLLABUS", url }, (response) => {
            if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError.message));
            }
            if (response?.error) {
                return reject(new Error(response.error));
            }
            resolve(response.html);
        });
    });
}

function parseSearchResults(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const rows = [...doc.querySelectorAll("#CPH1_gvw_kensaku tbody tr")];
    return rows.map((row, index) => ({
        lectureName: row.querySelector(".col3")?.textContent.trim() || "",
        subject: row.querySelector(".col7")?.textContent.trim() || "",
        syllabusID: row.querySelector(".col8 a")?.getAttribute("href") || "",
        campus:
            row.querySelector(`#CPH1_gvw_kensaku_lblJigen_${index} span`)?.textContent.replace(/[[\]]/g, "").trim() ||
            "",
        grade: row.querySelector(".col9")?.textContent.trim() || "",
        credits: row.querySelector(".col6")?.textContent.trim() || "",
        additionalInfo: row.querySelector(".col10")?.textContent.trim() || "",
    }));
}

function deduplicateBySyllabusID(syllabuses) {
    const seen = new Set();
    return syllabuses.filter((s) => {
        if (!s.syllabusID || seen.has(s.syllabusID)) return false;
        seen.add(s.syllabusID);
        return true;
    });
}

async function searchForCourse(course, majorCodes) {
    const url = buildSyllabusSearchUrl(course, majorCodes);
    let html = await fetchSyllabusHtml(url);
    let results = parseSearchResults(html);

    // Retry without lecturer if no results
    if (results.length === 0 && course.lecturer) {
        const retryUrl = buildSyllabusSearchUrl({ ...course, lecturer: "" }, majorCodes);
        html = await fetchSyllabusHtml(retryUrl);
        results = parseSearchResults(html);
    }

    return results;
}

async function fetchAllSyllabuses() {
    const storage = await new Promise((resolve) => chrome.storage.local.get(["courses", "selectedMajor"], resolve));
    const courses = storage.courses || [];
    const majorCodes = getMajorCodes(storage.selectedMajor || "");

    const results = [];

    for (const course of courses) {
        // Only process courses with a known day (not special courses day=7)
        if (course.day === 7 || course.day === undefined) {
            results.push({ courseId: course.id, courseName: course.trimmedTitle || course.fullTitle, syllabuses: [] });
            continue;
        }

        try {
            const syllabuses = await searchForCourse(course, majorCodes);
            results.push({
                courseId: course.id,
                courseName: course.trimmedTitle || course.fullTitle,
                syllabuses: deduplicateBySyllabusID(syllabuses),
            });
        } catch (err) {
            console.error(`Syllabus fetch failed for ${course.trimmedTitle}:`, err);
            results.push({ courseId: course.id, courseName: course.trimmedTitle || course.fullTitle, syllabuses: [] });
        }
    }

    await new Promise((resolve) => chrome.storage.local.set({ syllabuses: results }, resolve));
    return results;
}

export default fetchAllSyllabuses;
