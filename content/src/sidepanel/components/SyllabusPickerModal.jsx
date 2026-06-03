/* global chrome */
import { useState } from "react";
import "./SyllabusPickerModal.css";

const SYLLABUS_URL_PREFIX = "https://syllabus.aoyama.ac.jp/shousai.ashx?";

function buildSyllabusUrl(syllabusID) {
    const base = "https://syllabus.aoyama.ac.jp";
    return syllabusID.startsWith("?") || syllabusID.startsWith("/") ? `${base}${syllabusID}` : `${base}/${syllabusID}`;
}

// ── Conflict picker (2+ matches) ───────────────────────────────────────────
function ConflictPicker({ courseId, syllabusList, onClose, onConfirm }) {
    const [selected, setSelected] = useState(null);

    const handleConfirm = () => {
        if (!selected) return;
        onConfirm(courseId, selected);
        onClose();
    };

    return (
        <>
            <div className="spmodal__header">
                <h2 className="spmodal__title">シラバスを選択</h2>
                <button className="spmodal__close" onClick={onClose}>
                    ✕
                </button>
            </div>

            <p className="spmodal__subtitle">該当するシラバスが複数見つかりました。正しいものを選択してください。</p>

            <ul className="spmodal__list">
                {syllabusList.map((s, i) => {
                    const label = s.subject || s.lectureName || "シラバス";
                    const isSelected = selected?.syllabusID === s.syllabusID;
                    return (
                        <li
                            key={i}
                            className={`spmodal__item ${isSelected ? "spmodal__item--selected" : ""}`}
                            onClick={() => setSelected(s)}
                        >
                            <span className="spmodal__radio">
                                <span className={`spmodal__radio-dot ${isSelected ? "spmodal__radio-dot--on" : ""}`} />
                            </span>
                            <div className="spmodal__item-body">
                                <span className="spmodal__item-label">{s.lectureName || s.subject || "シラバス"}</span>
                                {s.subject && s.lectureName && (
                                    <span className="spmodal__item-subject">{s.subject}</span>
                                )}
                                {s.campus && <span className="spmodal__item-meta">キャンパス: {s.campus}</span>}
                                {s.grade && <span className="spmodal__item-meta">学年クラス: {s.grade}</span>}
                                {s.credits && <span className="spmodal__item-meta">単位: {s.credits}</span>}
                                {s.additionalInfo && <span className="spmodal__item-meta">{s.additionalInfo}</span>}
                            </div>
                            <a
                                className="spmodal__preview-link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(buildSyllabusUrl(s.syllabusID), "_blank", "noopener");
                                }}
                            >
                                開く
                            </a>
                        </li>
                    );
                })}
            </ul>

            <div className="spmodal__footer">
                <button className="spmodal__btn spmodal__btn--primary" onClick={handleConfirm} disabled={!selected}>
                    このシラバスを選択する
                </button>
            </div>
        </>
    );
}

// ── Manual URL input (0 matches) ───────────────────────────────────────────
function ManualInput({ courseId, onClose, onConfirm }) {
    const [url, setUrl] = useState("");
    const [subject, setSubject] = useState("");
    const [urlError, setUrlError] = useState(null);
    const [step, setStep] = useState("url"); // "url" | "subject"

    const handleUrlNext = () => {
        if (!url.startsWith(SYLLABUS_URL_PREFIX)) {
            setUrlError(`URLは "${SYLLABUS_URL_PREFIX}" から始まる必要があります。`);
            return;
        }
        setUrlError(null);
        setStep("subject");
    };

    const handleSubmit = () => {
        if (!subject.trim()) return;
        const entry = {
            syllabusID: url.replace("https://syllabus.aoyama.ac.jp", ""),
            subject: subject.trim(),
            lectureName: null,
            campus: null,
            grade: null,
            credits: null,
            additionalInfo: null,
        };
        onConfirm(courseId, entry);
        onClose();
    };

    return (
        <>
            <div className="spmodal__header">
                <h2 className="spmodal__title">シラバスURLを追加</h2>
                <button className="spmodal__close" onClick={onClose}>
                    ✕
                </button>
            </div>

            {step === "url" && (
                <>
                    <p className="spmodal__subtitle">
                        シラバスのURLを入力してください。
                        <br />
                        <span className="spmodal__hint">例: {SYLLABUS_URL_PREFIX}SLK=…</span>
                    </p>
                    <input
                        className="spmodal__input"
                        type="url"
                        placeholder={`${SYLLABUS_URL_PREFIX}SLK=...`}
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setUrlError(null);
                        }}
                        autoFocus
                    />
                    {urlError && <p className="spmodal__error">{urlError}</p>}
                    <div className="spmodal__footer">
                        <button
                            className="spmodal__btn spmodal__btn--primary"
                            onClick={handleUrlNext}
                            disabled={!url.trim()}
                        >
                            次へ
                        </button>
                    </div>
                </>
            )}

            {step === "subject" && (
                <>
                    <p className="spmodal__subtitle">
                        科目名を入力してください。
                        <br />
                        <span className="spmodal__hint">例: 情報テクノロジー学科</span>
                    </p>
                    <input
                        className="spmodal__input"
                        type="text"
                        placeholder="科目名"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && subject.trim() && handleSubmit()}
                        autoFocus
                    />
                    <div className="spmodal__footer">
                        <button className="spmodal__btn" onClick={() => setStep("url")}>
                            戻る
                        </button>
                        <button
                            className="spmodal__btn spmodal__btn--primary"
                            onClick={handleSubmit}
                            disabled={!subject.trim()}
                        >
                            追加する
                        </button>
                    </div>
                </>
            )}
        </>
    );
}

// ── Shell ──────────────────────────────────────────────────────────────────
function SyllabusPickerModal({ mode, courseId, syllabusList, onClose }) {
    // Persist selection to chrome.storage.local
    const handleConfirmConflict = (courseId, selectedSyllabus) => {
        chrome.storage.local.get("syllabuses", (result) => {
            const syllabuses = result.syllabuses || [];
            const updated = syllabuses.map((entry) =>
                entry.courseId === courseId ? { ...entry, syllabuses: [selectedSyllabus] } : entry,
            );
            chrome.storage.local.set({ syllabuses: updated });
        });
    };

    const handleConfirmManual = (courseId, entry) => {
        chrome.storage.local.get("syllabuses", (result) => {
            const syllabuses = result.syllabuses || [];
            const exists = syllabuses.some((e) => e.courseId === courseId);
            const updated = exists
                ? syllabuses.map((e) => (e.courseId === courseId ? { ...e, syllabuses: [entry] } : e))
                : [...syllabuses, { courseId, syllabuses: [entry] }];
            chrome.storage.local.set({ syllabuses: updated });
        });
    };

    return (
        <div className="spmodal-overlay" onClick={onClose}>
            <div className="spmodal" onClick={(e) => e.stopPropagation()}>
                {mode === "conflict" && (
                    <ConflictPicker
                        courseId={courseId}
                        syllabusList={syllabusList}
                        onClose={onClose}
                        onConfirm={handleConfirmConflict}
                    />
                )}
                {mode === "manual" && (
                    <ManualInput courseId={courseId} onClose={onClose} onConfirm={handleConfirmManual} />
                )}
            </div>
        </div>
    );
}

export default SyllabusPickerModal;
