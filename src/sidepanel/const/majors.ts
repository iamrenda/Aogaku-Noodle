export type Major = {
  label: string;
  // Department codes of the syllabus site search
  code: string[];
};

export type Faculty = {
  faculty: string;
  // Colour of the faculty heading
  accent: string;
  majors: Major[];
};

export const AOYAMA_STANDARD_CODE = "611020";

export const FACULTIES: Faculty[] = [
  {
    faculty: "文学部",
    accent: "#dc2626",
    majors: [
      { code: ["611100", "611130"], label: "英米文学科" },
      { code: ["611100", "611140"], label: "フランス文学科" },
      { code: ["611100", "611150"], label: "日本文学科" },
      { code: ["611100", "611160"], label: "史学科" },
      { code: ["611100", "611180"], label: "比較芸術学科" },
      { code: ["611100", "611101"], label: "文学部外国語科目" },
    ],
  },
  {
    faculty: "教育人間科学部",
    accent: "#ea580c",
    majors: [
      { code: ["611901"], label: "教育人間 外国語科目" },
      { code: ["611910"], label: "教育学科" },
      { code: ["611920"], label: "心理学科" },
    ],
  },
  {
    faculty: "経済学部",
    accent: "#d97706",
    majors: [
      { code: ["611200"], label: "経済学部経済学科" },
      { code: ["611200"], label: "現代経済デザイン学科" },
    ],
  },
  {
    faculty: "法学部",
    accent: "#c026d3",
    majors: [
      { code: ["6113__"], label: "法学科" },
      { code: ["6113__"], label: "ヒューマンライツ学科" },
    ],
  },
  {
    faculty: "経営学部",
    accent: "#ca8a04",
    majors: [
      { code: ["611400"], label: "経営学科" },
      { code: ["611400"], label: "マーケティング学科" },
    ],
  },
  {
    faculty: "総合文化政策学部",
    accent: "#65a30d",
    majors: [{ code: ["611710"], label: "総合文化政策学科" }],
  },
  {
    faculty: "国際政治経済学部",
    accent: "#0d9488",
    majors: [
      { code: ["611610"], label: "国際政治学科" },
      { code: ["611610"], label: "国際経済学科" },
      { code: ["611610"], label: "国際コミュニケーション学科" },
    ],
  },
  {
    faculty: "理工学部",
    accent: "#16a34a",
    majors: [
      { code: ["611500", "611590"], label: "物理科学科" },
      { code: ["611500", "6115A0"], label: "数理サイエンス学科" },
      { code: ["611500", "611520"], label: "化学・生命科学科" },
      { code: ["611500", "611540"], label: "電気電子工学科" },
      { code: ["611500", "611560"], label: "機械創造工学科" },
      { code: ["611500", "611570"], label: "経営システム工学科" },
      { code: ["611500", "611580"], label: "情報テクノロジー学科" },
    ],
  },
  {
    faculty: "社会情報学部",
    accent: "#0284c7",
    majors: [{ code: ["611810"], label: "社会情報学科" }],
  },
  {
    faculty: "地球社会共生学部",
    accent: "#059669",
    majors: [{ code: ["611A10"], label: "地球社会共生学科" }],
  },
  {
    faculty: "コミュニティ人間科学部",
    accent: "#ca8a04",
    majors: [{ code: ["611B00"], label: "コミュニティ人間科学科" }],
  },
];
