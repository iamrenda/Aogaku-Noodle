function YearFilter({ years, selectedYear, onChange }) {
    return (
        <div className="gv-year-filter" aria-label="年度フィルター">
            <button
                type="button"
                className={`gv-chip ${selectedYear === null ? "is-active" : ""}`}
                onClick={() => onChange(null)}
            >
                すべて
            </button>
            {years.map((year) => (
                <button
                    key={year}
                    type="button"
                    className={`gv-chip ${selectedYear === year ? "is-active" : ""}`}
                    onClick={() => onChange(year)}
                >
                    {year}
                </button>
            ))}
        </div>
    );
}

export default YearFilter;
