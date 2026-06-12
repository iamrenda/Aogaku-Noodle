/* global chrome */

import getDaysLeft from "../util/getDaysLeft";
import { MdVisibility, MdVisibilityOff, MdCheckCircle } from "react-icons/md";

function AssignmentCard({ assignment, index, onHide, onShow, onComplete, isHidden }) {
    const daysLeft = getDaysLeft(assignment.dueDate, assignment.isOverdue);
    const isOverdue = assignment.isOverdue;
    const isCustom = assignment.isCustom;

    const handleClick = async (e) => {
        e.preventDefault();

        if (!assignment.url) return; // custom assignments may have no link

        window.open(assignment.url, "_blank", "noopener");

        chrome.storage.local.get(["autoClosePanel"], (result) => {
            if (result.autoClosePanel !== false) {
                chrome.windows?.getCurrent(async (window) => {
                    await chrome.sidePanel?.close({
                        windowId: window.id,
                    });
                });
            }
        });
    };

    const handleComplete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onComplete?.(assignment.id);
    };

    const handleToggleHide = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isHidden) {
            onShow?.(assignment.id);
        } else {
            onHide?.(assignment.id);
        }
    };

    return (
        <a
            key={index}
            onClick={handleClick}
            className={`assignment-card ${isOverdue && !isHidden ? "urgent" : ""} ${isHidden ? "assignment-card--hidden" : ""} ${isCustom ? "assignment-card--custom" : ""}`}
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="card--header">
                <span className={`type-badge ${assignment.isAssignment ? "badge-assignment" : "badge-quiz"}`}>
                    {assignment.isAssignment ? "レポート" : "小テスト"}
                </span>
                <div className="assignment-card__actions">
                    {isCustom && onComplete && (
                        <button
                            className="assignment-card__complete-btn"
                            onClick={handleComplete}
                            title="完了にする"
                        >
                            <MdCheckCircle size={16} />
                        </button>
                    )}
                    <button className="assignment-card__hide-btn" onClick={handleToggleHide} title={isHidden ? "表示する" : "非表示にする"}>
                        {isHidden ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                    </button>
                </div>
            </div>
            <h3 className="assignment-title">{assignment.name}</h3>
            <div className="card--footer">
                <span className="class-name">{assignment.courseName}</span>
                {daysLeft && <div className={`days-left ${daysLeft === "期限切れ" ? "expired" : ""}`}>{daysLeft}</div>}
            </div>
        </a>
    );
}

export default AssignmentCard;
