function setDisplayAll() {
    const active = document.querySelector('[data-action="limit-toggle"] + .dropdown-menu .dropdown-item.active');

    // ✅ Already "すべて"
    if (active?.dataset.limit === "0") {
        return Promise.resolve(true);
    }

    const target = document.querySelector(
        '[data-action="limit-toggle"] + .dropdown-menu .dropdown-item[data-limit="0"]',
    );

    if (!target) {
        console.warn("Limit option not found");
        return Promise.resolve(false);
    }

    // 🧠 Mark that we already forced it (to avoid infinite reload loop)
    sessionStorage.setItem("limitForced", "true");

    // 🔥 Click and reload
    target.click();

    // Give LMS a tiny moment to apply state before reload
    setTimeout(() => {
        location.reload();
    }, 100);

    return new Promise(() => {}); // never resolves (page reloads)
}

export default setDisplayAll;
