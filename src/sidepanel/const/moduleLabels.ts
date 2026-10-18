// Japanese labels for known Moodle module names. Other module names are shown as they are
const MODULE_LABELS: Record<string, string> = {
  assign: "課題",
  questionnaire: "アンケート",
  resource: "資料",
};

export function moduleLabel(module: string): string {
  return Object.hasOwn(MODULE_LABELS, module) ? MODULE_LABELS[module] : module;
}
