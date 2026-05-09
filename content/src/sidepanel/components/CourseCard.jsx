/* global chrome */

function CourseCard({ course, dayIndex, index }) {
    const title = course.trimmedTitle || course.fullTitle;
    const subtitle = course.subtitle;
    const periodLabel = course.period ? `${course.period}限` : "オンデマ";

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
            {course.day !== 7 && (
                <div className="course-card__top">
                    <span className="course-card__badge">{periodLabel}</span>
                </div>
                )
            }

            <h4 className="course-card__title">{title}</h4>

            {subtitle && (
                <p className="course-card__subtitle">{subtitle}</p>
            )}
        </a>
    );
}

export default CourseCard;
