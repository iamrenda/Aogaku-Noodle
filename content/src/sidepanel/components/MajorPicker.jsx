import "./MajorPicker.css";

const GENERAL_MAJOR_CODE = "611020";

const faculties = [
    {
        faculty: "文学部",
        majors: [
            { code: ["611100", "611130"], label: "英米文学科" },
            { code: ["611100", "611140"], label: "フランス文学科" },
            { code: ["611100", "611150"], label: "日本文学科" },
            { code: ["611100", "611160"], label: "史学科" },
            { code: ["611100", "611180"], label: "比較芸術学科" },
            { code: ["611100", "611101"], label: "文学部外国語科目" },
        ],
    },
    {
        faculty: "教育人間科学部",
        majors: [
            { code: ["611901"], label: "教育人間 外国語科目" },
            { code: ["611910"], label: "教育学科" },
            { code: ["611920"], label: "心理学科" },
        ],
    },
    {
        faculty: "経済学部",
        majors: [
            { code: ["611200"], label: "経済学部経済学科" },
            { code: ["611200"], label: "現代経済デザイン学科" },
        ],
    },
    {
        faculty: "法学部",
        majors: [
            { code: ["6113__"], label: "法学科" },
            { code: ["6113__"], label: "ヒューマンライツ学科" },
        ],
    },
    {
        faculty: "経営学部",
        majors: [
            { code: ["611400"], label: "経営学科" },
            { code: ["611400"], label: "マーケティング学科" },
        ],
    },
    {
        faculty: "総合文化政策学部",
        majors: [{ code: ["611710"], label: "総合文化政策学科" }],
    },
    {
        faculty: "国際政治経済学部",
        majors: [
            { code: ["611610"], label: "国際政治学科" },
            { code: ["611610"], label: "国際経済学科" },
            { code: ["611610"], label: "国際コミュニケーション学科" },
        ],
    },
    {
        faculty: "理工学部",
        majors: [
            { code: ["611500", "611590"], label: "物理科学科" },
            { code: ["611500", "6115A0"], label: "数理サイエンス学科" },
            { code: ["611500", "611520"], label: "化学・生命科学科" },
            { code: ["611500", "611540"], label: "電気電子工学科" },
            { code: ["611500", "611560"], label: "機械創造工学科" },
            { code: ["611500", "611570"], label: "経営システム工学科" },
            { code: ["611500", "611580"], label: "情報テクノロジー学科" },
        ],
    },
    {
        faculty: "社会情報学部",
        majors: [{ code: ["611810"], label: "社会情報学科" }],
    },
    {
        faculty: "地球社会共生学部",
        majors: [{ code: ["611A10"], label: "地球社会共生学科" }],
    },
    {
        faculty: "コミュニティ人間科学部",
        majors: [{ code: ["611B00"], label: "コミュニティ人間科学科" }],
    },
];

const facultyAccentColors = {
    文学部: "#dc2626",
    教育人間科学部: "#ea580c",
    経済学部: "#d97706",
    法学部: "#c026d3",
    経営学部: "#ca8a04",
    総合文化政策学部: "#65a30d",
    国際政治経済学部: "#0d9488",
    理工学部: "#16a34a",
    社会情報学部: "#0284c7",
    地球社会共生学部: "#059669",
    コミュニティ人間科学部: "#ca8a04",
};

export { faculties, GENERAL_MAJOR_CODE };

function MajorPicker({ selectedMajor, onSelect, onClose }) {
    return (
        <div className="major-picker-overlay" onClick={onClose}>
            <div className="major-picker" onClick={(e) => e.stopPropagation()}>
                <div className="major-picker__header">
                    <h2 className="major-picker__title">学科を選択</h2>
                    <button className="major-picker__close" onClick={onClose}>✕</button>
                </div>

                <ul className="major-picker__faculty-list">
                    {faculties.map((facultyItem, fi) => {
                        const accentColor = facultyAccentColors[facultyItem.faculty] || "#1b9d6f";
                        return (
                            <li key={fi} className="major-picker__faculty-item">
                                <h3
                                    className="major-picker__faculty-name"
                                    style={{ color: accentColor }}
                                >
                                    {facultyItem.faculty}
                                </h3>
                                <ul className="major-picker__major-list">
                                    {facultyItem.majors.map((major, mi) => {
                                        const isSelected = major.label === selectedMajor;
                                        return (
                                            <li
                                                key={mi}
                                                className={`major-picker__major-item ${isSelected ? "major-picker__major-item--selected" : ""}`}
                                                style={{ borderColor: accentColor, color: isSelected ? accentColor : undefined }}
                                                onClick={() => onSelect(major.label)}
                                            >
                                                <span className="major-picker__major-label">{major.label}</span>
                                                {isSelected && <span className="major-picker__selected-badge">選択済み</span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {fi < faculties.length - 1 && <div className="major-picker__divider" />}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default MajorPicker;
