/**
 * Example: 2024-06-30T15:00:00.000Z -> "6/30 15:00"
 */
export default function formatDue(dueAt: number): string {
  const d = new Date(dueAt);
  const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
}
