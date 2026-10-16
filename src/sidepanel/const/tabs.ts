export type TabId = "courses" | "assignments" | "settings";

export const TABS: { id: TabId; label: string }[] = [
  { id: "courses", label: "講義" },
  { id: "assignments", label: "課題" },
  { id: "settings", label: "設定" },
];
