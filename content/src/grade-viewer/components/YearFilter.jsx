function YearFilter({ years, selectedYears, onChange }) {
    const toggleYear = (year) => {
        const next = selectedYears.includes(year)
            ? selectedYears.filter((item) => item !== year)
            : [...selectedYears, year];
        onChange(next);
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
                    className={`grade-viewer-filter-button ${selectedYears.includes(year) ? "is-active" : ""}`}
                    onClick={() => toggleYear(year)}
                >
                    {year}
                </button>
            ))}
        </section>
    );
}

export default YearFilter;
