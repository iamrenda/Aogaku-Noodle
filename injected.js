(function poll(attempt, delay) {
    const MAX_ATTEMPTS = 8;
    const MAX_DELAY = 3200;

    const sesskey = window?.M?.cfg?.sesskey;

    if (sesskey) {
        window.postMessage(
            { type: "MOODLE_SESSKEY_RESPONSE", sesskey },
            window.location.origin, // restrict to same origin
        );
        return;
    }

    if (attempt >= MAX_ATTEMPTS) {
        console.warn("[MoodleExt] window.M.cfg.sesskey not found after", attempt, "attempts");
        return;
    }

    setTimeout(() => poll(attempt + 1, Math.min(delay * 2, MAX_DELAY)), delay);
})(0, 50); // start: attempt 0, 50ms initial delay → 50, 100, 200, 400, 800, 1600, 3200ms
