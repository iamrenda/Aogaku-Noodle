/* global chrome */

import getDaysLeft from "../util/getDaysLeft";
import { CiCalendarDate } from "react-icons/ci";

function AssignmentCard({ assignment, index }) {
    const daysLeft = getDaysLeft(assignment.dueDate, assignment.isOverdue);
    const isOverdue = assignment.isOverdue;

    const handleClick = async (e) => {
        e.preventDefault();

        window.open(assignment.url, "_blank", "noopener");

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
            className={`assignment-card ${isOverdue ? "urgent" : ""}`}
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="card--header">
                <span className={`type-badge ${assignment.isAssignment ? "badge-assignment" : "badge-quiz"}`}>
                    {assignment.isAssignment ? "レポート" : "小テスト"}
                </span>
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
