/* global chrome */

function CourseCard({ course, dayIndex, index }) {
    return (
        <a
            onClick={async (e) => {
                e.preventDefault();

                window.open(course.link, "_blank", "noopener");

                chrome.storage.local.get(["autoClosePanel"], (result) => {
                    if (result.autoClosePanel !== false) {
                        chrome.windows.getCurrent(async (window) => {
                            await chrome.sidePanel.close({
                                windowId: window.id,
                            });
                        });
                    }
                });
            }}
            className="course-card"
            style={{ animationDelay: `${(dayIndex * 5 + index) * 0.05}s` }}
        >
            {course.period !== null && (
                <div className="card-header">
                    <span className="type-badge badge-course">{course.period ? `${course.period}限` : "オンデマ"}</span>
                </div>
            )}
            <h3 style={{ marginTop: course.period ? "0" : "0.5rem" }}>{course.trimmedTitle || course.fullTitle}</h3>
            {course.subtitle && (
                <div className="card-footer">
                    <div className="due-date">{course.subtitle}</div>
                </div>
            )}
        </a>
    );
}

export default CourseCard;
