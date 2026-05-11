function GradeSelectionCard({ grade, checked, onToggle }) {
    return (
        <article
            className="grade-selection-card"
            onClick={onToggle}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && onToggle()}
            aria-pressed={checked}
        >
            <div className="grade-selection-card__top">
                <div className="grade-selection-card__meta">
                    <p className="grade-selection-card__subject">{grade.class || "科目名なし"}</p>
                    <p className="grade-selection-card__lecturer">{grade.lecturer || "担当教員なし"}</p>
                </div>
                <input
                    className="grade-selection-card__checkbox"
                    type="checkbox"
                    checked={checked}
                    onChange={onToggle}
                    aria-label={`${grade.class || "科目"} を選択`}
                />
            </div>

            <div className="grade-selection-card__details">
                <span className="grade-selection-card__badge">{grade.year || "年度不明"}</span>
                <span className="grade-selection-card__badge">{grade.credit || "-"} 単位</span>
            </div>
        </article>
    );
}

export default GradeSelectionCard;
