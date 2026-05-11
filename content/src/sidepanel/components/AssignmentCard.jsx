/* global chrome */

import getDaysLeft from "../util/getDaysLeft";
import formatDate from "../util/formatDate";
import { CiCalendarDate } from "react-icons/ci";

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
            <div className="card--header">
                <span className={`type-badge ${assignment.type === "quiz" ? "badge-quiz" : "badge-assignment"}`}>
                    {assignment.type === "quiz" ? "小テスト" : "レポート"}
                </span>
                <span className="class-name">{assignment.className}</span>
            </div>
            <h3 className="assignment-title">{assignment.title}</h3>
            <div className="card--footer">
                <div className="due-date">
                    <CiCalendarDate />
                    {formatDate(assignment.date)} {assignment.time}
                </div>
                {daysLeft && <div className={`days-left ${daysLeft === "期限切れ" ? "expired" : ""}`}>{daysLeft}</div>}
            </div>
        </a>
    );
}

export default AssignmentCard;
