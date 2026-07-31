// GPA calculation following Aoyama Gakuin University's rules.
// https://www.aoyama.ac.jp/life/schooltime/grade_evaluation.html
//
// Grade legend (青学 official):
//   AA = 90-100  A = 80-89  B = 70-79  C = 60-69
//   ++ / ** = 認定 (exemption/certified pass)
//   FF = 未評価 (not yet evaluated)
//   XX = 不合格 (fail)
//   X  = 欠席等評価不能 (absent / unable to evaluate)
//   W  = 履修取消 (withdrawn)
//
// GPA = (AA*4 + A*3 + B*2 + C*1) weighted by credits
//       / (credits of AA + A + B + C + XX + X)
//
// 合格・認定 (++/**) courses such as 情報スキルI, and FF/W rows, are
// excluded entirely — they count toward neither the numerator nor the
// denominator.

const GRADE_POINTS = {
    AA: 4,
    A: 3,
    B: 2,
    C: 1,
};

// Failing grades: 0 points, but still counted in the denominator.
const FAIL_TOKENS = new Set(["XX", "X"]);

// Pass / 認定 / not-yet-evaluated / withdrawn markers — excluded from the GPA entirely.
const EXCLUDED_TOKENS = new Set(["合格", "合", "RR", "認定", "P", "++", "**", "FF", "W"]);

// Moodle/Noodle grade cells sometimes use fullwidth characters (Ａ Ｂ ＸＸ …).
function toHalfwidth(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９＋＊]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
}

function normalizeGrade(raw) {
    return toHalfwidth((raw || "").trim()).toUpperCase();
}

export function parseCredit(raw) {
    const value = parseFloat(String(raw ?? "").replace(/[^\d.]/g, ""));
    return Number.isFinite(value) ? value : 0;
}

// Classify a single grade row for GPA purposes.
// Returns { included: boolean, point: number|null, credit: number }.
export function classifyGrade(grade) {
    const symbol = normalizeGrade(grade?.grade);
    const credit = parseCredit(grade?.credit);

    if (symbol in GRADE_POINTS) {
        return { included: true, point: GRADE_POINTS[symbol], credit };
    }

    if (FAIL_TOKENS.has(symbol)) {
        return { included: true, point: 0, credit };
    }

    // 合格 / unknown / blank → excluded from the GPA
    return { included: false, point: null, credit };
}

export function isExcludedFromGpa(grade) {
    return EXCLUDED_TOKENS.has(normalizeGrade(grade?.grade));
}

// Compute the GPA over a list of grade rows. Returns a number or null when
// there is nothing that counts toward the GPA.
export function computeGpa(grades) {
    let weightedPoints = 0;
    let totalCredits = 0;

    for (const grade of grades || []) {
        const { included, point, credit } = classifyGrade(grade);

        if (!included || credit <= 0) {
            continue;
        }

        weightedPoints += point * credit;
        totalCredits += credit;
    }

    if (totalCredits === 0) {
        return null;
    }

    return weightedPoints / totalCredits;
}

export function formatGpa(value) {
    return typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : "—";
}

export { GRADE_POINTS };
