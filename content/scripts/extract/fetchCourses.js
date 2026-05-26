import getSesskey from "../util/getSesskey";
import parseCourseTitle from "../util/parseCourseTitle";

export default async function fetchCourses() {
    let sesskey;
    try {
        sesskey = await getSesskey();
    } catch (err) {
        console.error("[MoodleExt] Could not retrieve sesskey:", err.message);
        throw err;
    }

    const url = `/lib/ajax/service.php?sesskey=${encodeURIComponent(sesskey)}`;

    const payload = [
        {
            index: 0,
            methodname: "core_course_get_enrolled_courses_by_timeline_classification",
            args: {
                offset: 0,
                limit: 0,
                classification: "all",
                sort: "fullname",
                customfieldname: "week",
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

        const courses = data?.[0]?.data?.courses || [];

        return courses.map((course) => {
            const { day, period, className: trimmedTitle } = parseCourseTitle(course.fullname);

            return {
                id: course.id,
                fullTitle: course.fullname,
                trimmedTitle,
                shortname: course.shortname,
                day,
                period,
                link: course.viewurl || `https://agulms45.aim.aoyama.ac.jp/course/view.php?id=${course.id}`,
                image: course.courseimage,
            };
        });
    } catch (err) {
        console.error("[Noodle] API call failed while fetching courses:", err);
        throw err;
    }
}
