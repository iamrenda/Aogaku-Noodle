import "./SyllabusCard.css";

function SyllabusCard({ course, syllabusList }) {
    const title = course?.trimmedTitle || course?.fullTitle || "Untitled Course";
    const periodLabel = course?.period ? course.period : "*";

    // syllabusList === null  → not yet fetched (neutral / default style)
    // syllabusList.length === 0  → fetched, no hits (gray)
    // syllabusList.length === 1  → exactly one match (clickable, green)
    // syllabusList.length >= 2  → conflict (yellow)

    const state =
        syllabusList === null
            ? "pending"
            : syllabusList.length === 0
              ? "none"
              : syllabusList.length === 1
                ? "found"
                : "conflict";

    const handleClick = () => {
        if (state !== "found") return;
        const syllabusID = syllabusList[0].syllabusID;
        const base = "https://syllabus.aoyama.ac.jp";
        const url = syllabusID.startsWith("?") || syllabusID.startsWith("/")
            ? `${base}${syllabusID}`
            : `${base}/${syllabusID}`;
        window.open(url, "_blank", "noopener");
    };

    const stateLabel = {
        pending: null,
        none: "未検索",
        found: syllabusList?.[0]?.subject || syllabusList?.[0]?.lectureName || "シラバスを見る",
        conflict: `${syllabusList?.length}件該当`,
    };

    return (
        <div
            className={`syllabus-card syllabus-card--${state}`}
            onClick={handleClick}
        >
            {course?.day !== 7 && (
                <span className="syllabus-card__badge">{periodLabel}</span>
            )}

            <div className="syllabus-card__body">
                <h4 className="syllabus-card__title">{title}</h4>

                {state !== "pending" && (
                    <span className="syllabus-card__status">
                        {state === "none" && "シラバスなし"}
                        {state === "found" && stateLabel.found}
                        {state === "conflict" && stateLabel.conflict}
                    </span>
                )}
            </div>
        </div>
    );
}

export default SyllabusCard;
