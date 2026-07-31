function RevealCard({ grade, revealed, onReveal }) {
    return (
        <button
            type="button"
            className={`gv-reveal-card ${revealed ? "is-revealed" : ""}`}
            onClick={() => !revealed && onReveal()}
            aria-label={`${grade.class || "科目"} の成績`}
        >
            <div className="gv-reveal-card__inner">
                <div className="gv-reveal-card__face gv-reveal-card__face--closed">
                    <p className="gv-reveal-card__year">{grade.year || "—"}</p>
                    <p className="gv-reveal-card__subject">{grade.class || "科目名なし"}</p>
                    <p className="gv-reveal-card__hint">TAP TO OPEN</p>
                </div>

                <div className="gv-reveal-card__face gv-reveal-card__face--open">
                    <p className="gv-reveal-card__subject-open">{grade.class || "科目名なし"}</p>
                    <p className="gv-reveal-card__grade">{grade.grade || "—"}</p>
                    <p className="gv-reveal-card__meta">
                        {grade.lecturer || "担当教員なし"}
                        {grade.credit ? ` ／ ${grade.credit} 単位` : ""}
                    </p>
                </div>
            </div>
        </button>
    );
}

export default RevealCard;
