/* global chrome */

import { useEffect, useMemo, useState } from "react";
import YearFilter from "./components/YearFilter";
import GradeSelectionCard from "./components/GradeSelectionCard";
import GradeFlipCard from "./components/GradeFlipCard";

function getDistinctYears(grades) {
    return Array.from(
        new Set(
            grades
                .map((grade) => grade.year?.trim())
                .filter(Boolean),
        ),
    ).sort((left, right) => left.localeCompare(right, "ja", { numeric: true }));
}

function GradeSelectionScreen({ grades, onConfirm }) {
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedIndices, setSelectedIndices] = useState(() => new Set());

    const years = useMemo(() => getDistinctYears(grades), [grades]);

    const visibleGrades = useMemo(() => {
        if (selectedYears.length === 0) {
            return grades;
        }

        return grades.filter((grade) => selectedYears.includes(grade.year?.trim() || ""));
    }, [grades, selectedYears]);

    useEffect(() => {
        setSelectedIndices(new Set());
    }, [grades, selectedYears]);

    const toggleSelection = (index) => {
        setSelectedIndices((current) => {
            const next = new Set(current);

            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }

            return next;
        });
    };

    const handleConfirm = () => {
        const selectedGrades = visibleGrades.filter((_, index) => selectedIndices.has(index));
        onConfirm(selectedGrades);
    };

    return (
        <div className="grade-viewer-screen grade-viewer-screen--select">
            <header className="grade-viewer-header">
                <div>
                    <p className="grade-viewer-kicker">Grade Viewer</p>
                    <h1 className="grade-viewer-title">成績を選択</h1>
                </div>
                <p className="grade-viewer-subtitle">年度で絞り込み、表示したい科目を選んでください。</p>
            </header>

            <YearFilter years={years} selectedYears={selectedYears} onChange={setSelectedYears} />

            <main className="grade-selection-grid">
                {visibleGrades.length === 0 ? (
                    <div className="grade-viewer-empty">該当する成績がありません。</div>
                ) : (
                    visibleGrades.map((grade, index) => (
                        <GradeSelectionCard
                            key={`${grade.subject || grade.class || "grade"}-${index}`}
                            grade={grade}
                            checked={selectedIndices.has(index)}
                            onToggle={() => toggleSelection(index)}
                        />
                    ))
                )}
            </main>

            <footer className="grade-viewer-footer">
                <button type="button" className="grade-viewer-confirm-button" onClick={handleConfirm}>
                    決定
                </button>
            </footer>
        </div>
    );
}

function GradeDetailScreen({ grades, onBack }) {
    return (
        <div className="grade-viewer-screen grade-viewer-screen--detail">
            <header className="grade-viewer-header grade-viewer-header--detail">
                <div>
                    <p className="grade-viewer-kicker">Selected Classes</p>
                    <h1 className="grade-viewer-title">成績ビューア</h1>
                </div>
                <button type="button" className="grade-viewer-back-button" onClick={onBack}>
                    戻る
                </button>
            </header>

            {grades.length === 0 ? (
                <div className="grade-viewer-empty grade-viewer-empty--detail">表示する成績がありません。</div>
            ) : (
                <main className="grade-flip-grid">
                    {grades.map((grade, index) => (
                        <GradeFlipCard key={`${grade.subject || grade.class || "flip"}-${index}`} grade={grade} />
                    ))}
                </main>
            )}
        </div>
    );
}

export function GradeViewerApp() {
    const [grades, setGrades] = useState([]);
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [screen, setScreen] = useState("select");

    useEffect(() => {
        chrome.storage.local.get(["gradeViewerData"], (result) => {
            setGrades(Array.isArray(result.gradeViewerData) ? result.gradeViewerData : []);
        });

        const listener = (changes, namespace) => {
            if (namespace === "local" && changes.gradeViewerData) {
                setGrades(Array.isArray(changes.gradeViewerData.newValue) ? changes.gradeViewerData.newValue : []);
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, []);

    const handleConfirm = (nextGrades) => {
        setSelectedGrades(nextGrades);
        setScreen("detail");
    };

    if (screen === "detail") {
        return <GradeDetailScreen grades={selectedGrades} onBack={() => setScreen("select")} />;
    }

    return <GradeSelectionScreen grades={grades} onConfirm={handleConfirm} />;
}

export default GradeViewerApp;