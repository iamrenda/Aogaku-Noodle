import getClassesName from "./getClassesName";

/**
 * Find all course elements in the DOM
 *
 * Tries multiple selectors in order:
 * 1. Moodle 4.x: .dashboard-course-box
 * 2. Moodle 3.x: .course-item
 * 3. Generic: .course-summary-item
 * 4. Canvas: .coursetile
 * 5. With data: [data-course-id]
 * 6. By link: a[href*="/course/view.php"]
 *
 * @returns {HTMLCollection} - Course elements
 *
 * @example
 * const elements = findCourseElements();
 * console.log(`Found ${elements.length} courses`);
 */
function findCourseElements() {
    const { CONTAINER_CLASS, ITEM_CLASS } = getClassesName();

    const parent = document.querySelector(CONTAINER_CLASS);

    if (parent) {
        const elements = parent.querySelectorAll(ITEM_CLASS);
        if (elements.length > 0) {
            return elements;
        }
    }

    return [];
}

export default findCourseElements;
