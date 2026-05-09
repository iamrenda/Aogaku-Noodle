import parseCourseTitle from "../util/parseCourseTitle";

function extractAssignments(doc) {
    const results = [];

    // loop each date section
    const dateSections = doc.querySelectorAll('[data-region="event-list-content-date"]');

    dateSections.forEach((section) => {
        const dateText = section.querySelector("h5")?.innerText.trim();
        const timestamp = section.dataset.timestamp;

        // next sibling = list-group
        const list = section.nextElementSibling;
        if (!list) return;

        const items = list.querySelectorAll('[data-region="event-list-item"]');

        items.forEach((item) => {
            const time = item.querySelector("small")?.innerText.trim();

            const linkEl = item.querySelector(".event-name a");
            const title = linkEl?.innerText.trim();
            const link = linkEl?.href;

            const meta = item.querySelector(".event-name-container small")?.innerText.trim() || "";

            const [, course] = meta.split("·").map((s) => s?.trim());
            const { className } = parseCourseTitle(course);
            let assignmentType = null;

            if (link) {
                if (link.includes("/mod/assign/")) assignmentType = "assignment";
                if (link.includes("/mod/quiz/")) assignmentType = "quiz";
            }

            results.push({
                title,
                link,
                type: assignmentType || null,
                className: className || course || null,
                date: dateText,
                timestamp: Number(timestamp),
                time,
            });
        });
    });

    return results;
}

export default extractAssignments;
