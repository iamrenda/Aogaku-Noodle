function SelectorCard({ grade, checked, onToggle }) {
    return (
        <article
            className={`gv-select-card ${checked ? "is-checked" : ""}`}
            role="button"
            tabIndex={0}
            aria-pressed={checked}
            onClick={onToggle}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggle();
                }
            }}
        >
            <div className="gv-select-card__top">
                <p className="gv-select-card__subject">{grade.class || "科目名なし"}</p>
                <span className="gv-select-card__check" aria-hidden="true">
                    {checked ? "✓" : ""}
                </span>
            </div>

            <p className="gv-select-card__lecturer">{grade.lecturer || "担当教員なし"}</p>

            <div className="gv-select-card__bottom">
                <span className="gv-select-card__year">{grade.year || "—"}</span>
                <span className="gv-select-card__credit">{grade.credit || "—"} 単位</span>
            </div>
        </article>
    );
}

export default SelectorCard;
