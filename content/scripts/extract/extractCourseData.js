import getClassesName from "../util/getClassesName";
import parseCourseTitle from "../util/parseCourseTitle";

/**
 * Extract course data from a single DOM element
 *
 * Looks for title, subtitle, and link in the element
 *
 * @param {HTMLElement} element - Course element from DOM
 * @returns {Object} - Course object with properties:
 *   - fullTitle: Original course title
 *   - trimmedTitle: Cleaned course title
 *   - subtitle: Progress, date, etc (if found)
 *   - day: Day number 0-6 (if found)
 *   - link: Course URL (if found)
 *
 * @example
 * const element = document.querySelector('.course-item');
 * const course = extractCourseFromElement(element);
 * // {
 * //   fullTitle: '金4限_システム構築実習_Projects in Computer Systems Operation
Course name金4限_システム構築実習_Projects in Computer Systems Operation',
 * //   trimmedTitle: 'Monday Class',
 * //   subtitle: '特設コース2026',
 * //   day: 1,
 * //   period: 2,
 * //   link: 'https://...'
 * // }
 */
function extractCourseData(courseElement) {
    const { TITLE_CLASS, SUBTITLE_CLASS } = getClassesName();

    const titleEl = courseElement.querySelector(TITLE_CLASS);

    const subtitleEl = courseElement.querySelector(SUBTITLE_CLASS);

    const fullTitle = titleEl ? titleEl.textContent : "";

    if (!fullTitle) {
        console.warn("Could not extract title from course element:", courseElement);
    }
    const subtitle = subtitleEl ? subtitleEl.textContent.trim() : "";
    const { day, period, className: trimmedTitle } = parseCourseTitle(fullTitle);

    return {
        fullTitle,
        trimmedTitle,
        subtitle,
        day,
        period,
        link: courseElement.querySelector("a")?.href || "",
    };
}

export default extractCourseData;
