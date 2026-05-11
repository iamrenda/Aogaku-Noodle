import { useState } from "react";

function GradeFlipCard({ grade }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <button type="button" className={`grade-flip-card ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((current) => !current)} aria-label={`${grade.subject || "科目"} の成績カード`}>
            <div className="grade-flip-card__inner">
                <div className="grade-flip-card__face grade-flip-card__face--front">
                    <p className="grade-flip-card__subject">{grade.subject || "科目名なし"}</p>
                    <p className="grade-flip-card__lecturer">{grade.lecturer || "担当教員なし"}</p>
                    <p className="grade-flip-card__hint">クリックで成績を表示</p>
                </div>

                <div className="grade-flip-card__face grade-flip-card__face--back">
                    <p className="grade-flip-card__grade-label">Grade</p>
                    <p className="grade-flip-card__grade">{grade.grade || "-"}</p>
                    <p className="grade-flip-card__meta">
                        {grade.year || "年度不明"} / {grade.credit || "-"} 単位
                    </p>
                </div>
            </div>
        </button>
    );
}

export default GradeFlipCard;