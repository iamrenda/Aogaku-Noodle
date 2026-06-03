import { useState } from "react";
import "./SyllabusCard.css";
import SyllabusPickerModal from "./SyllabusPickerModal";

function buildSyllabusUrl(syllabusID) {
    const base = "https://syllabus.aoyama.ac.jp";
    return syllabusID.startsWith("?") || syllabusID.startsWith("/")
        ? `${base}${syllabusID}`
        : `${base}/${syllabusID}`;
}

function SyllabusCard({ course, syllabusList }) {
    const [modal, setModal] = useState(null); // null | "conflict" | "manual"

    const title = course?.trimmedTitle || course?.fullTitle || "Untitled Course";
    const periodLabel = course?.period ? course.period : "*";

    // syllabusList === null  → not yet fetched (pending)
    // syllabusList.length === 0  → fetched, no hits (none)
    // syllabusList.length === 1  → exactly one match (found)
    // syllabusList.length >= 2  → conflict (yellow)
    const state =
        syllabusList === null
            ? "pending"
            : syllabusList.length === 0
              ? "none"
              : syllabusList.length === 1
                ? "found"
                : "conflict";

    const handleCardClick = () => {
        if (state === "found") {
            window.open(buildSyllabusUrl(syllabusList[0].syllabusID), "_blank", "noopener");
        } else if (state === "conflict") {
            setModal("conflict");
        }
    };

    return (
        <>
            <div className={`syllabus-card syllabus-card--${state}`} onClick={handleCardClick}>
                {course?.day !== 7 && (
                    <span className="syllabus-card__badge">{periodLabel}</span>
                )}

                <div className="syllabus-card__body">
                    <h4 className="syllabus-card__title">{title}</h4>

                    {state === "found" && (
                        <span className="syllabus-card__status">
                            {syllabusList[0].subject || syllabusList[0].lectureName || "シラバスを見る"}
                        </span>
                    )}
                    {state === "conflict" && (
                        <span className="syllabus-card__status">{syllabusList.length}件該当 — タップして選択</span>
                    )}
                    {state === "none" && (
                        <a
                            className="syllabus-card__add-link"
                            onClick={(e) => { e.stopPropagation(); setModal("manual"); }}
                        >
                            シラバスURLを追加する
                        </a>
                    )}
                </div>
            </div>

            {modal === "conflict" && (
                <SyllabusPickerModal
                    mode="conflict"
                    courseId={course.id}
                    syllabusList={syllabusList}
                    onClose={() => setModal(null)}
                />
            )}
            {modal === "manual" && (
                <SyllabusPickerModal
                    mode="manual"
                    courseId={course.id}
                    onClose={() => setModal(null)}
                />
            )}
        </>
    );
}

export default SyllabusCard;
