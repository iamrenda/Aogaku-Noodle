import "./CourseCard.css";

function CourseCard({ course }) {
    const title = course?.trimmedTitle || course?.fullTitle || "Untitled Course";
    const periodLabel = course?.period ? course.period : "*";

    return (
        <a className="course-card" href={course?.link || "#"} target="_blank" rel="noopener noreferrer">
            {course?.day !== 7 && <span className="course-card__badge">{periodLabel}</span>}

            <h4 className="course-card__title">{title}</h4>
        </a>
    );
}

export default CourseCard;
