const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Describes how long ago a time was, e.g. たった今 / 5分前 / 3時間前 / 2日前
 * `stale` is true once a day or more has passed
 */
export default function formatElapsed(from: number, now: number): { text: string; stale: boolean } {
  const elapsed = Math.max(0, now - from);

  if (elapsed < MINUTE) return { text: "たった今", stale: false };
  if (elapsed < HOUR) return { text: `${Math.floor(elapsed / MINUTE)}分前`, stale: false };
  if (elapsed < DAY) return { text: `${Math.floor(elapsed / HOUR)}時間前`, stale: false };
  return { text: `${Math.floor(elapsed / DAY)}日前`, stale: true };
}
