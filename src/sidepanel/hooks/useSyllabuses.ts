import { useCallback, useEffect, useState } from "react";
import type { Syllabus, SyllabusMap } from "../types/syllabus";
import { saveSyllabuses } from "../utils/selectionStore";

/**
 * Provides the saved syllabus search result of one course (chrome.storage.local `syllabuses`).
 * `syllabuses` is undefined until the course has been searched.
 */
export default function useSyllabuses(courseId: number) {
  const [syllabuses, setSyllabuses] = useState<Syllabus[] | undefined>(undefined);

  useEffect(() => {
    chrome.storage.local.get("syllabuses").then((saved) => {
      setSyllabuses((saved.syllabuses as SyllabusMap | undefined)?.[courseId]);
    });

    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && changes.syllabuses) {
        setSyllabuses((changes.syllabuses.newValue as SyllabusMap | undefined)?.[courseId]);
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, [courseId]);

  // Resolves a conflict by keeping only the chosen syllabus
  const choose = useCallback(
    async (syllabus: Syllabus) => {
      await saveSyllabuses({ [courseId]: [syllabus] }, true);
    },
    [courseId],
  );

  return { syllabuses, choose };
}
