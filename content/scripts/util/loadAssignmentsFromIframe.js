import { ASSIGNMENTS_DISPLAY_METHOD } from "../const/classNames";
import extractAssignments from "../extract/extractAssignments";

function handleIframe(doc, iframe, resolve) {
    // 👇 click "show all"
    const item = doc.querySelector(ASSIGNMENTS_DISPLAY_METHOD);
    item?.click();

    // 👇 wait for DOM update
    let timeout;

    const observer = new MutationObserver(() => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            const assignments = extractAssignments(doc);

            if (assignments.length > 0) {
                observer.disconnect();

                // optional cleanup
                iframe.remove();

                resolve(assignments);
            }
        }, 200);
    });

    observer.observe(doc.body, {
        childList: true,
        subtree: true,
    });
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
