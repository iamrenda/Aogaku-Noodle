/**
 * Group courses by day of week
 *
 * Creates buckets for each day:
 * - 0: Sunday
 * - 1: Monday
 * - 2: Tuesday
 * - 3: Wednesday
 * - 4: Thursday
 * - 5: Friday
 * - 6: Saturday
 * - 7: Unknown (no day found)
 *
 * @param {Array<Object>} courses - Array of course objects
 * @returns {Object} - Object with days as keys, course arrays as values
 *
 * @example
 * const courses = extractAllCourses();
 * const grouped = groupCoursesByDay(courses);
 * console.log(grouped[1]); // All Monday courses
 * console.log(grouped[7]); // Courses with no day specified
 */
function groupCoursesByDay(courses) {
    const grouped = {
        0: [], // Sunday
        1: [], // Monday
        2: [], // Tuesday
        3: [], // Wednesday
        4: [], // Thursday
        5: [], // Friday
        6: [], // Saturday
        7: [], // Unknown/No day
    };

    courses.forEach((course) => {
        const dayKey = course.day !== undefined ? course.day : 7;
        grouped[dayKey].push(course);
    });

    return grouped;
}

export default groupCoursesByDay;
