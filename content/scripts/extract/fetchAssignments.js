import getSesskey from "../util/getSesskey";
import parseCourseTitle from "../util/parseCourseTitle";

export default async function fetchAssignments() {
    let sesskey;
    try {
        sesskey = await getSesskey();
    } catch (err) {
        console.error("[MoodleExt] Could not retrieve sesskey:", err.message);
        return;
    }

    const timesortfrom = Math.floor(Date.now() / 1000);
    const url = `/lib/ajax/service.php?sesskey=${encodeURIComponent(sesskey)}`;

    const payload = [
        {
            index: 0,
            methodname: "core_calendar_get_action_events_by_timesort",
            args: {
                limitnum: 50,
                timesortfrom,
                limittononsuspendedevents: true,
            },
        },
    ];

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const assignments = data?.[0]?.data?.events || [];

        return assignments.map((assignment) => ({
            id: assignment.id,
            name: assignment.activityname,
            courseName: parseCourseTitle(assignment.coursefullname).className || assignment.coursefullname,
            dueDate: assignment.timesort,
            isAssignment: assignment.modulename === "assign",
            isOverdue: assignment.overdue,
            url: assignment.url,
        }));
    } catch (err) {
        console.error("[Noodle] API call failed:", err);
    }
}
