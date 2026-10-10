import type { Assignment, AssignmentModule } from "../types/assignment";

const DAY = 24 * 60 * 60 * 1000;

function dueIn(days: number, hour: number): number {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}

// [title, course, module, days from today, hour]
const rows: [string, string, AssignmentModule, number, number][] = [
  ["第1回 レポート課題", "社会学概論", "assign", -21, 23],
  ["履修アンケート", "プログラミング基礎", "questionnaire", -14, 17],
  ["第2回 小テスト", "プログラミング基礎", "assign", -9, 17],
  ["第3回 レポート課題", "社会学概論", "assign", -2, 23],
  ["第5回 小テスト", "データ構造とアルゴリズム", "assign", 0, 23],
  ["期末レポート（最終提出）", "経済学入門", "assign", 1, 17],
  ["講義資料の確認", "キリスト教概論", "resource", 2, 12],
  ["礼拝レポート 第3回", "キリスト教概論", "assign", 3, 12],
  ["授業アンケート", "経済学入門", "questionnaire", 4, 23],
  ["第6回 確認テスト", "線形代数学Ⅱ", "assign", 5, 23],
  ["第7回 小テスト", "データ構造とアルゴリズム", "assign", 6, 23],
  ["参考文献リスト", "情報セキュリティ", "resource", 7, 9],
  ["中間レポート：ネットワークの脆弱性について", "情報セキュリティ", "assign", 9, 23],
  ["リスニング小テスト Unit 8", "English Communication", "assign", 12, 9],
  ["第8回 レポート課題", "社会学概論", "assign", 14, 23],
  ["中間アンケート", "線形代数学Ⅱ", "questionnaire", 15, 23],
  ["第9回 小テスト", "データ構造とアルゴリズム", "assign", 17, 23],
  ["Speaking Task 3", "English Communication", "assign", 19, 9],
  ["第10回 確認テスト", "線形代数学Ⅱ", "assign", 21, 23],
  ["グループ課題資料", "経済学入門", "resource", 23, 12],
  ["第4回 レポート課題", "プログラミング基礎", "assign", 25, 23],
  ["礼拝レポート 第4回", "キリスト教概論", "assign", 28, 12],
  ["第11回 小テスト", "データ構造とアルゴリズム", "assign", 31, 23],
  ["最終アンケート", "社会学概論", "questionnaire", 35, 23],
  ["期末レポート", "情報セキュリティ", "assign", 42, 23],
  ["期末課題", "English Communication", "assign", 49, 9],
];

// Placeholder until the real Moodle fetch is wired up
const mockAssignments: Assignment[] = rows.map(([title, courseName, module, days, hour], i) => ({
  id: i + 1,
  title,
  courseName,
  module,
  dueAt: dueIn(days, hour),
  link: "#",
}));

export default mockAssignments;
