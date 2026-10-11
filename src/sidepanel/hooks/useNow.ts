import { useEffect, useState } from "react";

/**
 * Current time in ms, re-evaluated every `intervalMs` so relative times stay fresh
 */
export default function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
