function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Calculates the number of calendar days from today until the deadline day.
 * (0 = due today, negative = overdue)
 */
export default function daysLeft(dueAt: number, now: number = Date.now()): number {
  const DAY = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(dueAt) - startOfDay(now)) / DAY);
}
