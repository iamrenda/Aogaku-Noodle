import { MOODLE_ORIGIN_URL } from "../const/moodleUrl";

export class NotOnMoodleError extends Error {}
export class FetchFailedError extends Error {}

type PageResult = { data: unknown } | { error: string };

// Use iff the user is on a Moodle page
async function requestInPage(
  methodname: string,
  args: Record<string, unknown>,
): Promise<PageResult> {
  const sesskey = (window as unknown as { M?: { cfg?: { sesskey?: string } } }).M?.cfg?.sesskey;

  if (!sesskey) return { error: "sesskey not found" };

  const response = await fetch(`/lib/ajax/service.php?sesskey=${encodeURIComponent(sesskey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{ index: 0, methodname, args }]),
  });
  if (!response.ok) return { error: `HTTP ${response.status}` };

  const body = await response.json();
  if (body?.[0]?.error) return { error: String(body[0].exception?.message ?? "API error") };

  return { data: body?.[0]?.data };
}

/**
 * Calls a Moodle web service method from the current Moodle tab
 * @argument methodname: Moodle API method name
 * @argument args: arguments to the Moodle API method
 * @throws NotOnMoodleError: not on a Moodle page
 * @throws FetchFailedError: the request failed
 * @returns the `data` of the response; the caller is responsible for its shape
 */
export default async function callMoodleApi<T>(
  methodname: string,
  args: Record<string, unknown>,
): Promise<T> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined || !tab.url?.startsWith(MOODLE_ORIGIN_URL))
    throw new NotOnMoodleError();

  let result: PageResult | undefined;
  try {
    [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: requestInPage,
      args: [methodname, args],
    });
  } catch (error) {
    throw new FetchFailedError(error instanceof Error ? error.message : String(error));
  }

  if (!result || "error" in result) throw new FetchFailedError(result?.error ?? "no result");
  return result.data as T;
}
