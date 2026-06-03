/* global chrome */

import "./CourseCard.css";

function CourseCard({ course }) {
    const title = course?.trimmedTitle || course?.fullTitle || "Untitled Course";
    const periodLabel = course?.period ? course.period : "*";

    const handleClick = (e) => {
        e.preventDefault();

        window.open(course?.link || "#", "_blank", "noopener");

        chrome.storage.local.get(["autoClosePanel"], (result) => {
            if (result.autoClosePanel !== false) {
                chrome.windows.getCurrent(async (window) => {
                    await chrome.sidePanel.close({
                        windowId: window.id,
                    });
                });
            }
        });
    };

    return (
        <a className="course-card" onClick={handleClick}>
            {course?.day !== 7 && <span className="course-card__badge">{periodLabel}</span>}
            <h4 className="course-card__title">{title}</h4>
        </a>
    );
}

export default CourseCard;
