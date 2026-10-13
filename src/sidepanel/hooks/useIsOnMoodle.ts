import { useEffect, useState } from "react";
import { MOODLE_ORIGIN_URL } from "../const/moodleUrl";

/**
 * Tells whether the active tab is on Moodle, and keeps following the active tab
 */
export default function useIsOnMoodle() {
  const [isOnMoodle, setIsOnMoodle] = useState(false);

  useEffect(() => {
    const check = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      setIsOnMoodle(tab?.url?.startsWith(MOODLE_ORIGIN_URL) ?? false);
    };
    check();

    // Tab switched, page navigated, or another window focused
    chrome.tabs.onActivated.addListener(check);
    chrome.tabs.onUpdated.addListener(check);
    chrome.windows.onFocusChanged.addListener(check);
    return () => {
      chrome.tabs.onActivated.removeListener(check);
      chrome.tabs.onUpdated.removeListener(check);
      chrome.windows.onFocusChanged.removeListener(check);
    };
  }, []);

  return isOnMoodle;
}
