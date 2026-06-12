/* global chrome */
import { useState, useEffect } from "react";
import "./AddAssignmentModal.css";

/**
 * Bottom-sheet form for adding a user-created ("custom") assignment.
 * Persists the new entry to `customAssignments` in chrome.storage.local; the
 * Quick Access and Home Tabs lists pick it up via their storage listeners.
 *
 * Fields: name (required), 種別 (assignment/quiz), course (nullable),
 * due date (nullable), URL (nullable).
 */
function AddAssignmentModal({ onClose }) {
    const [courses, setCourses] = useState([]);
    const [name, setName] = useState("");
    const [dueDate, setDueDate] = useState(""); // datetime-local string
    const [url, setUrl] = useState("");
    const [courseId, setCourseId] = useState("");
    const [isAssignment, setIsAssignment] = useState(true);

    useEffect(() => {
        chrome.storage.local.get(["courses"], (result) => {
            setCourses(result.courses || []);
        });
    }, []);

    // Courses with day === 7 are unscheduled/other and not pickable here.
    const selectableCourses = courses.filter((c) => c.day !== 7);

    const handleSubmit = () => {
        if (!name.trim() || !dueDate) return;

        const selected = courses.find((c) => String(c.id) === String(courseId));
        const entry = {
            id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: name.trim(),
            courseName: selected ? selected.trimmedTitle || selected.fullTitle : "その他",
            courseId: selected ? selected.id : null,
            dueDate: Math.floor(new Date(dueDate).getTime() / 1000),
            url: url.trim() || null,
            isAssignment,
            isCustom: true,
            completed: false,
        };

        chrome.storage.local.get(["customAssignments"], (result) => {
            const list = result.customAssignments || [];
            chrome.storage.local.set({ customAssignments: [...list, entry] }, onClose);
        });
    };

    return (
        <div className="aamodal-overlay" onClick={onClose}>
            <div className="aamodal" onClick={(e) => e.stopPropagation()}>
                <div className="aamodal__header">
                    <h2 className="aamodal__title">課題を追加</h2>
                    <button className="aamodal__close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="aamodal__body">
                    <label className="aamodal__field">
                        <span className="aamodal__label">
                            課題名 <span className="aamodal__req">*</span>
                        </span>
                        <input
                            className="aamodal__input"
                            type="text"
                            placeholder="課題名を入力"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </label>

                    <div className="aamodal__field">
                        <span className="aamodal__label">種別</span>
                        <div className="aamodal__seg">
                            <button
                                type="button"
                                className={`aamodal__seg-btn ${isAssignment ? "aamodal__seg-btn--active" : ""}`}
                                onClick={() => setIsAssignment(true)}
                            >
                                レポート
                            </button>
                            <button
                                type="button"
                                className={`aamodal__seg-btn ${!isAssignment ? "aamodal__seg-btn--active" : ""}`}
                                onClick={() => setIsAssignment(false)}
                            >
                                小テスト
                            </button>
                        </div>
                    </div>

                    <label className="aamodal__field">
                        <span className="aamodal__label">講義</span>
                        <select
                            className="aamodal__input"
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                        >
                            <option value="">その他 / 未選択</option>
                            {selectableCourses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.trimmedTitle || c.fullTitle}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="aamodal__field">
                        <span className="aamodal__label">
                            締切日 <span className="aamodal__req">*</span>
                        </span>
                        <input
                            className="aamodal__input"
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </label>

                    <label className="aamodal__field">
                        <span className="aamodal__label">
                            URL <span className="aamodal__optional">(任意)</span>
                        </span>
                        <input
                            className="aamodal__input"
                            type="url"
                            placeholder="https://..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </label>
                </div>

                <div className="aamodal__footer">
                    <button className="aamodal__btn" onClick={onClose}>
                        キャンセル
                    </button>
                    <button
                        className="aamodal__btn aamodal__btn--primary"
                        onClick={handleSubmit}
                        disabled={!name.trim() || !dueDate}
                    >
                        追加する
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddAssignmentModal;
