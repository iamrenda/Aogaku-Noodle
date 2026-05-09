import { SUBMISSION_CONFETTI_ID } from "./constants.js";

export function createConfetti() {
    const existing = document.getElementById(SUBMISSION_CONFETTI_ID);
    if (existing) existing.remove();

    const layer = document.createElement("div");
    layer.id = SUBMISSION_CONFETTI_ID;

    const colors = ["#34d399", "#f59e0b", "#60a5fa", "#f472b6", "#facc15", "#a78bfa"];
    const count = 67;

    for (let index = 0; index < count; index += 1) {
        const piece = document.createElement("span");
        const size = 6 + Math.random() * 7;
        const left = Math.random() * 100;
        const drift = (Math.random() * 2 - 1) * 160;
        const duration = 1800 + Math.random() * 1200;
        const rotate = Math.random() * 360;
        const color = colors[index % colors.length];

        piece.className = "confetti-piece";
        piece.style.setProperty("--size", `${size}px`);
        piece.style.setProperty("--left", `${left}vw`);
        piece.style.setProperty("--drift", `${drift}px`);
        piece.style.setProperty("--duration", `${duration}ms`);
        piece.style.setProperty("--rotate", `${rotate}deg`);
        piece.style.setProperty("--color", color);
        piece.style.animationDelay = `${Math.random() * 220}ms`;

        layer.appendChild(piece);
    }

    document.body.appendChild(layer);

    window.setTimeout(() => {
        layer.remove();
    }, 4200);
}
