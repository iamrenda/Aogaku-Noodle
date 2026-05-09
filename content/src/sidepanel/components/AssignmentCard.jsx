/* global chrome */

import getDaysLeft from "../util/getDaysLeft";
import formatDate from "../util/formatDate";

function AssignmentCard({ assignment, index }) {
    const daysLeft = getDaysLeft(assignment.timestamp);
    const isUrgent =
        assignment.timestamp &&
        assignment.timestamp * 1000 - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
        assignment.timestamp * 1000 - Date.now() > 0;

    const handleClick = async (e) => {
        e.preventDefault();

        window.open(assignment.link, "_blank", "noopener");

        chrome.storage.local.get(["autoClosePanel"], (result) => {
            if (result.autoClosePanel !== false) {
                chrome.windows.getCurrent(async (window) => {
                    await chrome.sidePanel.close({
                        windowId: window.id,
                    });
                });
            }
        });
    };

    return (
        <a
            key={index}
            onClick={handleClick}
            className={`assignment-card ${isUrgent ? "urgent" : ""}`}
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="card-header">
                <span className={`type-badge ${assignment.type === "quiz" ? "badge-quiz" : "badge-assignment"}`}>
                    {assignment.type === "quiz" ? "小テスト" : "レポート"}
                </span>
                <span className="class-name">{assignment.className}</span>
            </div>
            <h3 className="assignment-title">{assignment.title}</h3>
            <div className="card-footer">
                <div className="due-date">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {formatDate(assignment.date)} {assignment.time}
                </div>
                {daysLeft && <div className={`days-left ${daysLeft === "期限切れ" ? "expired" : ""}`}>{daysLeft}</div>}
            </div>
        </a>
    );
}

export default AssignmentCard;
