import { SUBMISSION_TOAST_ID } from "./constants.js";

const messages = [
    "提出できました！よく頑張りました！",
    "提出完了！本当にお疲れさま！",
    "提出おめでとう！素晴らしい集中力だったよ！",
    "よくやった！提出バッチリだよ！",
    "67 (Six-Seven) 🤷",
];

export function createToast() {
    const existing = document.getElementById(SUBMISSION_TOAST_ID);
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = SUBMISSION_TOAST_ID;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = `
        <span class="submission-toast__icon">✓</span>
        <span>${messages[Math.floor(Math.random() * messages.length)]}</span>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("is-visible");
    });

    window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => {
            toast.remove();
        }, 350);
    }, 3200);
}
