/* global chrome */

import "./CourseCard.css";

function CourseCard({ course, syllabusList }) {
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

    const handleSyllabusClick = (e, syllabusID) => {
        e.preventDefault();
        e.stopPropagation();
        const base = "https://syllabus.aoyama.ac.jp/";
        const url = syllabusID.startsWith("?") || syllabusID.startsWith("/")
            ? `${base.replace(/\/$/, "")}${syllabusID}`
            : `${base}${syllabusID}`;
        window.open(url, "_blank", "noopener");
    };

    return (
        <div className="course-card-wrapper">
            <a className="course-card" onClick={handleClick}>
                {course?.day !== 7 && <span className="course-card__badge">{periodLabel}</span>}
                <h4 className="course-card__title">{title}</h4>
            </a>

            {syllabusList && syllabusList.length > 0 && (
                <div className="course-card__syllabuses">
                    {syllabusList.map((s, i) => (
                        <a
                            key={i}
                            className="course-card__syllabus-link"
                            onClick={(e) => handleSyllabusClick(e, s.syllabusID)}
                        >
                            {s.lectureName || s.subject || "シラバス"}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CourseCard;
