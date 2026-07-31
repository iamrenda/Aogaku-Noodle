/* global chrome */

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { computeGpa, formatGpa } from "../util/gpa";
import { useCountUp } from "../util/useCountUp";
import ExportCard, { EXPORT_HEIGHT, EXPORT_WIDTH } from "./ExportCard";

function SummaryScreen({ grades, cumulativeGpa, onRestart }) {
    const selectedGpa = useMemo(() => computeGpa(grades), [grades]);
    const animatedCumulativeGpa = useCountUp(cumulativeGpa);
    const animatedSelectedGpa = useCountUp(selectedGpa);

    const qrSrc = useMemo(() => {
        try {
            return chrome.runtime.getURL("icons/qr-code.png");
        } catch {
            return null;
        }
    }, []);

    const columns = useMemo(() => {
        const mid = Math.ceil(grades.length / 2);
        return [grades.slice(0, mid), grades.slice(mid)];
    }, [grades]);

    const exportRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = useCallback(async () => {
        if (!exportRef.current || isExporting) {
            return;
        }

        setIsExporting(true);

        try {
            const dataUrl = await toPng(exportRef.current, {
                width: EXPORT_WIDTH,
                height: EXPORT_HEIGHT,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
            });

            const link = document.createElement("a");
            link.download = `seiseki-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to export grade summary image:", error);
        } finally {
            setIsExporting(false);
        }
    }, [isExporting]);

    return (
        <div className="gv-screen gv-screen--summary">
            <header className="gv-topbar">
                <p className="gv-brandmark">GRADE VIEWER</p>
            </header>

            <div className="gv-summary-card">
                <aside className="gv-summary-aside">
                    <div className="gv-gpa-block">
                        <p className="gv-gpa-label gv-gpa-label--accent">累積GPA</p>
                        <p className="gv-gpa-value">
                            {formatGpa(animatedCumulativeGpa)}
                            <span className="gv-gpa-scale">/ 4.00</span>
                        </p>
                    </div>

                    <div className="gv-gpa-block gv-gpa-block--term">
                        <p className="gv-gpa-label">今期のGPA</p>
                        <p className="gv-gpa-value gv-gpa-value--sm">
                            {formatGpa(animatedSelectedGpa)}
                            <span className="gv-gpa-scale">/ 4.00</span>
                        </p>
                    </div>

                    <div className="gv-brand-footer">
                        {qrSrc ? <img className="gv-brand-qr" src={qrSrc} alt="QRコード" /> : null}
                        <div className="gv-brand-text">
                            <p className="gv-brand-name">青学Noodle</p>
                            <p className="gv-brand-sub">Chrome拡張機能で成績をもっと楽しく</p>
                        </div>
                    </div>
                </aside>

                <div className="gv-summary-list">
                    {columns.map((column, columnIndex) => (
                        <div className="gv-summary-column" key={columnIndex}>
                            {column.map((grade, index) => (
                                <div className="gv-summary-row" key={`${columnIndex}-${index}`}>
                                    <span className="gv-summary-subject">{grade.class || "科目名なし"}</span>
                                    <span className="gv-summary-grade">{grade.grade || "—"}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="gv-summary-actions">
                <button type="button" className="gv-ghost-button" onClick={onRestart}>
                    最初に戻る
                </button>
                <button type="button" className="gv-primary-button" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? "作成中…" : "画像として保存"}
                </button>
            </div>

            <div className="gv-export-offscreen" aria-hidden="true">
                <ExportCard ref={exportRef} grades={grades} cumulativeGpa={cumulativeGpa} qrSrc={qrSrc} />
            </div>
        </div>
    );
}

export default SummaryScreen;
