export type AssignmentModule = "assign" | "questionnaire" | "resource";

export type Assignment = {
  id: number;
  title: string;
  courseName: string;
  module: AssignmentModule;
  // Deadline as epoch ms
  dueAt: number;
  link: string;
};
