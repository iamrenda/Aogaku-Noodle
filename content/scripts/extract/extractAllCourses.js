import findCourseElements from "../util/findCourseElements";
import extractCourseData from "./extractCourseData";

/**
 * Extract all courses from the page
 *
 * Combines findCourseElements() and extractCourseData()
 *
 * @returns {Array<Object>} - Array of course objects
 *
 * @example
 * const courses = extractAllCourses();
 * console.log(`Extracted ${courses.length} courses`);
 */
function extractAllCourses() {
    const courseElements = findCourseElements();
    return Array.from(courseElements).map(extractCourseData);
}

export default extractAllCourses;
