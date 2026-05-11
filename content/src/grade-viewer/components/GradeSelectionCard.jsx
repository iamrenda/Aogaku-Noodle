function GradeSelectionCard({ grade, checked, onToggle }) {
    return (
        <article className="grade-selection-card">
            <div className="grade-selection-card__top">
                <div className="grade-selection-card__meta">
                    <p className="grade-selection-card__subject">{grade.subject || "科目名なし"}</p>
                    <p className="grade-selection-card__lecturer">{grade.lecturer || "担当教員なし"}</p>
                </div>
                <input className="grade-selection-card__checkbox" type="checkbox" checked={checked} onChange={onToggle} aria-label={`${grade.subject || "科目"} を選択`} />
            </div>

            <div className="grade-selection-card__details">
                <span className="grade-selection-card__badge">{grade.year || "年度不明"}</span>
                <span className="grade-selection-card__badge">{grade.credit || "-"} 単位</span>
            </div>

            <p className="grade-viewer-subtitle">チェックして決定すると、次の画面で成績だけを表示します。</p>
        </article>
    );
}

export default GradeSelectionCard;