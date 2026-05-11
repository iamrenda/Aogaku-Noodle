function YearFilter({ years, selectedYears, onChange }) {
    const selectYear = (year) => {
        onChange([year]);
    };

    return (
        <section className="grade-viewer-filter" aria-label="年度フィルター">
            <button
                type="button"
                className={`grade-viewer-filter-button ${selectedYears.length === 0 ? "is-active" : ""}`}
                onClick={() => onChange([])}
            >
                すべて
            </button>
            {years.map((year) => (
                <button
                    key={year}
                    type="button"
                    className={`grade-viewer-filter-button ${selectedYears.length === 1 && selectedYears[0] === year ? "is-active" : ""}`}
                    onClick={() => selectYear(year)}
                >
                    {year}
                </button>
            ))}
        </section>
    );
}

export default YearFilter;
