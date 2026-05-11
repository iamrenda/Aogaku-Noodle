function getCellText(cells, index) {
    return cells[index]?.textContent?.trim() || "";
}

function scrapeGradeRows(doc = document) {
    const table = doc.querySelector("#cph_content_gvw_seiseki");

    if (!table) {
        return [];
    }

    const rows = table.querySelectorAll("tbody tr");

    return Array.from(rows)
        .slice(1)
        .map((row) => {
            const cells = row.querySelectorAll("td");

            if (!cells.length) {
                return null;
            }

            return {
                class: getCellText(cells, 0),
                lecturer: getCellText(cells, 1),
                grade: getCellText(cells, 2),
                credit: getCellText(cells, 3),
                year: getCellText(cells, 4),
                subject: getCellText(cells, 5),
            };
        })
        .filter((row) => row && (row.class || row.lecturer || row.grade || row.credit || row.year || row.subject));
}

export default scrapeGradeRows;
