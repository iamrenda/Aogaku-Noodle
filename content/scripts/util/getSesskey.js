/* global chrome */

const SESSKEY_MESSAGE_TYPE = "MOODLE_SESSKEY_RESPONSE";
const INJECT_FLAG = "moodleInjected";
const SESSKEY_TIMEOUT_MS = 15_000;

let cachedSesskey = null;

// Injects the Main World helper exactly once, guarded by a dataset flag.
function injectMainWorldScript() {
    if (document.documentElement.dataset[INJECT_FLAG]) return;
    document.documentElement.dataset[INJECT_FLAG] = "1";

    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injected.js");
    script.onload = () => script.remove();
    (document.head ?? document.documentElement).appendChild(script);
}

// Returns a promise that resolves once the sesskey is received (or rejects on timeout).
// Subsequent calls resolve immediately from cache.
export default function getSesskey() {
    if (cachedSesskey) return Promise.resolve(cachedSesskey);

    return new Promise((resolve, reject) => {
        const deadline = setTimeout(() => {
            reject(new Error("Timed out waiting for Moodle sesskey"));
        }, SESSKEY_TIMEOUT_MS);

        // AbortController lets us cleanly remove the listener after the first hit.
        const ac = new AbortController();

        window.addEventListener(
            "message",
            (event) => {
                if (
                    event.source !== window ||
                    !event.data ||
                    event.data.type !== SESSKEY_MESSAGE_TYPE ||
                    typeof event.data.sesskey !== "string"
                )
                    return;

                clearTimeout(deadline);
                ac.abort(); // removes this listener automatically
                cachedSesskey = event.data.sesskey;
                resolve(cachedSesskey);
            },
            { signal: ac.signal },
        );

        injectMainWorldScript();
    });
}
