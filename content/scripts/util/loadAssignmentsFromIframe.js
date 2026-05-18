import { ASSIGNMENTS_DISPLAY_METHOD } from "../const/classNames";
import extractAssignments from "../extract/extractAssignments";

function waitForDomToSettle(doc, action, stableDelay = 300, timeoutMs = 5000) {
    return new Promise((resolve) => {
        let settledTimer;
        let timeoutTimer;
        let observer;

        const finish = () => {
            observer?.disconnect();
            clearTimeout(settledTimer);
            clearTimeout(timeoutTimer);
            resolve();
        };

        const scheduleFinish = () => {
            clearTimeout(settledTimer);
            settledTimer = setTimeout(finish, stableDelay);
        };

        observer = new MutationObserver(scheduleFinish);

        observer.observe(doc.body, {
            childList: true,
            subtree: true,
            attributes: true,
        });

        action?.();

        timeoutTimer = setTimeout(finish, timeoutMs);
        scheduleFinish();
    });
}

async function handleIframe(doc, iframe, resolve) {
    const showAllBtn = doc.querySelector(ASSIGNMENTS_DISPLAY_METHOD);
    if (showAllBtn) {
        await waitForDomToSettle(doc, () => showAllBtn.click());
    }

    const moreEventsButton = doc.querySelector('[data-action="more-events"]');
    if (moreEventsButton) {
        await waitForDomToSettle(doc, () => moreEventsButton.click());
    }

    let assignments = extractAssignments(doc);

    if (assignments.length === 0) {
        await waitForDomToSettle(doc, null);
        assignments = extractAssignments(doc);
    }

    // iframe.remove();
    resolve(assignments);
}

function loadAssignmentsFromIframe() {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement("iframe");
        iframe.src = "https://agulms45.aim.aoyama.ac.jp/my/";
        iframe.style.display = "none";

        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;

                if (!doc) {
                    reject("Cannot access iframe document");
                    return;
                }

                handleIframe(doc, iframe, resolve);
            } catch (err) {
                reject(err);
            }
        };
    });
}

export default loadAssignmentsFromIframe;
