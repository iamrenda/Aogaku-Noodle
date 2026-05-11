/* global chrome */

import "./overlay.css";

const OVERLAY_ROOT_ID = "agu-grade-overlay-root";

function waitForElement(selector, callback) {
    const target = document.querySelector(selector);

    if (target) {
        callback(target);
        return;
    }

    const observer = new MutationObserver(() => {
        const found = document.querySelector(selector);

        if (found) {
            observer.disconnect();
            callback(found);
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
}

function createButton(label, variant, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `agu-grade-button agu-grade-button--${variant}`;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function positionOverlay(root, container) {
    const rect = container.getBoundingClientRect();

    root.style.position = "fixed";
    root.style.left = `${rect.left}px`;
    root.style.top = `${rect.top}px`;
    root.style.width = `${rect.width}px`;
    root.style.height = `${rect.height}px`;
}

function initGradeViewerOverlay({ scrapeGradeRows }) {
    if (document.getElementById(OVERLAY_ROOT_ID)) {
        return;
    }

    waitForElement(".tuuti-container", (container) => {
        const existingRoot = document.getElementById(OVERLAY_ROOT_ID);
        if (existingRoot) {
            return;
        }

        container.style.filter = "blur(6px)";
        container.style.webkitFilter = "blur(6px)";

        let grades = scrapeGradeRows(document);

        const root = document.createElement("div");
        root.id = OVERLAY_ROOT_ID;
        root.className = "agu-grade-overlay-root";

        const panel = document.createElement("div");
        panel.className = "agu-grade-overlay-panel";

        const card = document.createElement("div");
        card.className = "agu-grade-overlay-card";

        const title = document.createElement("p");
        title.className = "agu-grade-overlay-title";
        title.textContent = "成績の表示方法を選択";

        const status = document.createElement("p");
        status.className = "agu-grade-overlay-status";

        const updateStatus = () => {
            status.textContent =
                grades.length > 0
                    ? `成績データを ${grades.length} 件読み込みました。`
                    : "成績データを取得できませんでした。";
        };

        const refreshGrades = () => {
            const nextGrades = scrapeGradeRows(document);

            if (
                nextGrades.length !== grades.length ||
                nextGrades.some((grade, index) => JSON.stringify(grade) !== JSON.stringify(grades[index]))
            ) {
                grades = nextGrades;
                updateStatus();
            }
        };

        updateStatus();

        const actions = document.createElement("div");
        actions.className = "agu-grade-overlay-actions";

        const syncPosition = () => {
            positionOverlay(root, container);
            refreshGrades();
        };

        const revealButton = createButton("すべての成績を見る", "secondary", () => {
            container.style.filter = "none";
            container.style.webkitFilter = "none";
            root.remove();
            window.removeEventListener("resize", syncPosition);
            window.removeEventListener("scroll", syncPosition, true);
        });

        const viewerButton = createButton("成績ビューアで見る", "primary", () => {
            try {
                chrome.runtime.sendMessage({
                    type: "OPEN_GRADE_VIEWER",
                    grades,
                    sourceUrl: window.location.href,
                });
                status.textContent =
                    grades.length > 0 ? "成績ビューアを開いています。" : "データが不完全でもビューアを開きます。";
            } catch (error) {
                console.warn("Failed to open grade viewer:", error);
                status.textContent = "成績ビューアを開けませんでした。";
            }
        });

        actions.append(viewerButton, revealButton);
        card.append(title, status, actions);
        panel.append(card);
        root.append(panel);

        document.body.appendChild(root);

        syncPosition();

        window.addEventListener("resize", syncPosition);
        window.addEventListener("scroll", syncPosition, true);

        const observer = new MutationObserver(() => {
            if (!document.body.contains(container)) {
                observer.disconnect();
                root.remove();
                return;
            }

            syncPosition();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

export default initGradeViewerOverlay;
