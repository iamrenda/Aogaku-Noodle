export type Syllabus = {
  // Absolute URL of the syllabus page; also identifies the entry
  url: string;
  name: string;
  // 開講区分, e.g. 青山スタンダード科目
  subject: string;
  campus: string;
  // e.g. （前期）
  term: string;
  grade: string;
  credits: string;
  note: string;
};

// Search results by course id. [] means searched but nothing found
export type SyllabusMap = Record<number, Syllabus[]>;
