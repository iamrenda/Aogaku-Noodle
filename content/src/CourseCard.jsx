function CourseCard({ course }) {
    const title = course?.trimmedTitle || course?.fullTitle || "Untitled Course";
    const subtitle = course?.subtitle;
    const periodLabel = course?.period ? `${course.period}` : "*";

    return (
        <a className="course-card" href={course?.link || "#"} target="_blank" rel="noopener noreferrer">
            {course?.day === 7 || (
                <div className="course-card__top">
                    <span className="course-card__badge">{periodLabel}</span>
                </div>
            )}

            <h4 className="course-card__title">{title}</h4>

            {subtitle && <p className="course-card__subtitle">{subtitle}</p>}
        </a>
    );
}

export default CourseCard;
