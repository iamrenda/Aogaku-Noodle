/**
 * Parse course title into structured data
 *
 * @param {string} title
 * @returns {{ day: number, period: number|null, className: string|null }}
 */
function parseCourseTitle(title) {
    if (typeof title !== "string") {
        return { day: 7, period: null, className: null };
    }

    const dayMap = {
        日: 0,
        月: 1,
        火: 2,
        水: 3,
        木: 4,
        金: 5,
        土: 6,
    };

    const prefixRegex = /^(月|火|水|木|金|土|日)([1-8])限/;
    const onlineRegex = /^(月|火|水|木|金|土|日)オンライン/;

    let match = title.match(prefixRegex);

    if (match) {
        const [, jpDay, period] = match;

        // Extract class name after prefix (optional)
        const rest = title.replace(prefixRegex, "").replace(/^_/, "");

        // If there's underscore, take JP part before EN
        const jpName = rest.split("_")[0];

        return {
            day: dayMap[jpDay] ?? 7,
            period: Number(period),
            className: jpName || null,
        };
    }

    match = title.match(onlineRegex);

    if (match) {
        const [, jpDay] = match;

        const rest = title.replace(onlineRegex, "").replace(/^_/, "");
        const jpName = rest.split("_")[0];

        return {
            day: dayMap[jpDay] ?? 7,
            period: 0,
            className: jpName || null,
        };
    }

    // Fallback
    return {
        day: 7,
        period: null,
        className: title || null,
    };
}

export default parseCourseTitle;
