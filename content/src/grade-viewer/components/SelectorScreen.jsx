import { useEffect, useMemo, useState } from "react";
import YearFilter from "./YearFilter";
import SelectorCard from "./SelectorCard";

function getDistinctYears(grades) {
    return Array.from(new Set(grades.map((grade) => grade.year?.trim()).filter(Boolean))).sort((left, right) =>
        right.localeCompare(left, "ja", { numeric: true }),
    );
}

function SelectorScreen({ grades, onConfirm }) {
    const [selectedYear, setSelectedYear] = useState(null);
    const [query, setQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState(() => new Set());

    const years = useMemo(() => getDistinctYears(grades), [grades]);

    const visibleGrades = useMemo(() => {
        const needle = query.trim().toLowerCase();

        return grades
            .map((grade, id) => ({ grade, id }))
            .filter(({ grade }) => {
                if (selectedYear !== null && (grade.year?.trim() || "") !== selectedYear) {
                    return false;
                }

                if (!needle) {
                    return true;
                }

                return (
                    (grade.class || "").toLowerCase().includes(needle) ||
                    (grade.lecturer || "").toLowerCase().includes(needle)
                );
            });
    }, [grades, selectedYear, query]);

    // Drop selections that fall off when the underlying data changes.
    useEffect(() => {
        setSelectedIds((current) => {
            const next = new Set();
            current.forEach((id) => {
                if (id < grades.length) {
                    next.add(id);
                }
            });
            return next.size === current.size ? current : next;
        });
    }, [grades]);

    const toggle = (id) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAllVisible = () => {
        setSelectedIds((current) => {
            const next = new Set(current);
            visibleGrades.forEach(({ id }) => next.add(id));
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleConfirm = () => {
        const chosen = grades.filter((_, id) => selectedIds.has(id));
        onConfirm(chosen);
    };

    return (
        <div className="gv-screen gv-screen--selector">
            <header className="gv-topbar">
                <p className="gv-brandmark">GRADE VIEWER</p>
            </header>

            <div className="gv-selector-body">
                <div className="gv-toolbar">
                    <input
                        type="text"
                        className="gv-search"
                        placeholder="科目名・教員名で検索"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <div className="gv-toolbar__actions">
                        <button type="button" className="gv-pill-button" onClick={selectAllVisible}>
                            表示中をすべて選択
                        </button>
                        <button type="button" className="gv-pill-button" onClick={clearSelection}>
                            選択を解除
                        </button>
                    </div>
                </div>

                <YearFilter years={years} selectedYear={selectedYear} onChange={setSelectedYear} />

                {visibleGrades.length === 0 ? (
                    <div className="gv-empty">該当する成績がありません。</div>
                ) : (
                    <div className="gv-selector-grid">
                        {visibleGrades.map(({ grade, id }) => (
                            <SelectorCard
                                key={id}
                                grade={grade}
                                checked={selectedIds.has(id)}
                                onToggle={() => toggle(id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className={`gv-floating-bar ${selectedIds.size > 0 ? "is-visible" : ""}`}>
                <span className="gv-floating-bar__count">{selectedIds.size} 科目を選択中</span>
                <button
                    type="button"
                    className="gv-floating-bar__button"
                    onClick={handleConfirm}
                    disabled={selectedIds.size === 0}
                >
                    開封する
                </button>
            </div>
        </div>
    );
}

export default SelectorScreen;
