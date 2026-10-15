import { useCallback, useEffect, useState } from "react";

/**
 * Provides the selected major label from chrome.storage.local (`selectedMajor`).
 * It is null while unset, so "delete saved data" (storage.clear) also clears it.
 */
export default function useMajor() {
  const [major, setMajor] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get("selectedMajor").then((saved) => {
      setMajor((saved.selectedMajor as string | undefined) ?? null);
    });

    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== "local" || !changes.selectedMajor) return;
      setMajor((changes.selectedMajor.newValue as string | undefined) ?? null);
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  const selectMajor = useCallback(async (label: string) => {
    await chrome.storage.local.set({ selectedMajor: label });
  }, []);

  return { major, selectMajor };
}
