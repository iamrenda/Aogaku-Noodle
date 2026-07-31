import { forwardRef, useMemo } from "react";
import { computeGpa, formatGpa } from "../util/gpa";

// The exported PNG is always this exact pixel size, no matter how many
// subjects are selected — row height/font-size scale down (and the list
// truncates with a "ほか N 件" row) to fit instead of growing the canvas.
export const EXPORT_WIDTH = 1080;
export const EXPORT_HEIGHT = 1350;

const PADDING = 64;
const HEADER_HEIGHT = 190;
const FOOTER_HEIGHT = 92;
const SECTION_GAP = 28;
const COLUMNS = 2;
const MIN_ROW_HEIGHT = 30;
const MAX_ROW_HEIGHT = 52;

const LIST_HEIGHT = EXPORT_HEIGHT - PADDING * 2 - HEADER_HEIGHT - FOOTER_HEIGHT - SECTION_GAP * 2;

function computeListLayout(count) {
    const maxRowsPerColumn = Math.max(1, Math.floor(LIST_HEIGHT / MIN_ROW_HEIGHT));
    const maxItems = maxRowsPerColumn * COLUMNS;

    const truncated = count > maxItems;
    const displayCount = truncated ? Math.max(0, maxItems - 1) : count;
    const rowSlots = truncated ? displayCount + 1 : displayCount;
    const rowsPerColumn = Math.max(1, Math.ceil(rowSlots / COLUMNS));

    const rowHeight = Math.min(MAX_ROW_HEIGHT, Math.max(MIN_ROW_HEIGHT, LIST_HEIGHT / rowsPerColumn));
    const fontSize = Math.max(12, Math.min(19, rowHeight * 0.42));

    return {
        displayCount,
        truncated,
        remaining: count - displayCount,
        rowHeight,
        fontSize,
    };
}

const ExportCard = forwardRef(function ExportCard({ grades, cumulativeGpa, qrSrc }, ref) {
    const selectedGpa = useMemo(() => computeGpa(grades), [grades]);
    const layout = useMemo(() => computeListLayout(grades.length), [grades.length]);

    const { columns, remaining } = useMemo(() => {
        const visible = grades.slice(0, layout.displayCount);
        const mid = Math.ceil(visible.length / 2);
        return { columns: [visible.slice(0, mid), visible.slice(mid)], remaining: layout.remaining };
    }, [grades, layout]);

    return (
        <div ref={ref} className="gv-export-card" style={{ width: EXPORT_WIDTH, height: EXPORT_HEIGHT, padding: PADDING }}>
            <div className="gv-export-header" style={{ height: HEADER_HEIGHT }}>
                <div className="gv-export-gpa-block">
                    <p className="gv-export-gpa-label gv-export-gpa-label--accent">累積GPA</p>
                    <p className="gv-export-gpa-value">
                        {formatGpa(cumulativeGpa)}
                        <span className="gv-export-gpa-scale">/ 4.00</span>
                    </p>
                </div>
                <div className="gv-export-gpa-block">
                    <p className="gv-export-gpa-label">今期のGPA</p>
                    <p className="gv-export-gpa-value gv-export-gpa-value--sm">
                        {formatGpa(selectedGpa)}
                        <span className="gv-export-gpa-scale">/ 4.00</span>
                    </p>
                </div>
            </div>

            <div className="gv-export-list" style={{ height: LIST_HEIGHT }}>
                {columns.map((column, columnIndex) => (
                    <div className="gv-export-column" key={columnIndex}>
                        {column.map((grade, index) => (
                            <div
                                className="gv-export-row"
                                style={{ height: layout.rowHeight, fontSize: layout.fontSize }}
                                key={`${columnIndex}-${index}`}
                            >
                                <span className="gv-export-subject">{grade.class || "科目名なし"}</span>
                                <span className="gv-export-grade">{grade.grade || "—"}</span>
                            </div>
                        ))}
                        {columnIndex === columns.length - 1 && layout.truncated ? (
                            <div
                                className="gv-export-row gv-export-row--more"
                                style={{ height: layout.rowHeight, fontSize: layout.fontSize }}
                            >
                                <span className="gv-export-subject">ほか {remaining} 件</span>
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>

            <div className="gv-export-footer" style={{ height: FOOTER_HEIGHT }}>
                {qrSrc ? <img className="gv-export-qr" src={qrSrc} alt="" /> : null}
                <div className="gv-export-brand-text">
                    <p className="gv-export-brand-name">青学Noodle</p>
                    <p className="gv-export-brand-sub">Chrome拡張機能で成績をもっと楽しく</p>
                </div>
            </div>
        </div>
    );
});

export default ExportCard;
