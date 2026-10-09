export type Course = {
  period: number;
  title: string;
  lecturer: string;
};

export const COURSES: Record<number, Course[]> = {
  1: [
    { period: 1, title: "ミクロ経済学入門", lecturer: "田中 健一" },
    { period: 3, title: "英語コミュニケーションⅡ", lecturer: "Sarah Mitchell" },
    { period: 4, title: "情報リテラシー", lecturer: "佐藤 美咲" },
    { period: 5, title: "キリスト教概論", lecturer: "山口 誠" },
  ],
  2: [
    { period: 2, title: "統計学基礎", lecturer: "高橋 直樹" },
    { period: 3, title: "マクロ経済学入門", lecturer: "伊藤 優子" },
    { period: 5, title: "経営学総論", lecturer: "中村 大輔" },
  ],
  3: [
    { period: 1, title: "会計学入門", lecturer: "小林 恵" },
    { period: 4, title: "第二外国語（フランス語）", lecturer: "Claire Dubois" },
  ],
  4: [
    { period: 2, title: "プログラミング演習", lecturer: "渡辺 隆" },
    { period: 3, title: "社会学概論", lecturer: "加藤 梨花" },
    { period: 4, title: "データサイエンス入門", lecturer: "松本 悠" },
  ],
  5: [{ period: 2, title: "法学（憲法）", lecturer: "木村 正人" }],
};
