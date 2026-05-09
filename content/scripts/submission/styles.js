import { SUBMISSION_TOAST_ID, SUBMISSION_CONFETTI_ID } from "./constants.js";

export function loadSubmissionStyles() {
    if (document.getElementById("aogaku-noodle-submission-styles")) return;

    const style = document.createElement("style");
    style.id = "aogaku-noodle-submission-styles";
    style.textContent = `
        #${SUBMISSION_TOAST_ID} {
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translate(-50%, -140%);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: min(92vw, 420px);
            padding: 14px 18px;
            border-radius: 999px;
            background: rgba(17, 24, 39, 0.96);
            color: #ffffff;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.28);
            font: 600 14px/1.35 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            letter-spacing: 0.01em;
            opacity: 0;
            transition: transform 320ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 320ms ease;
            pointer-events: none;
        }

        #${SUBMISSION_TOAST_ID}.is-visible {
            transform: translate(-50%, 0);
            opacity: 1;
        }

        #${SUBMISSION_TOAST_ID} .submission-toast__icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 999px;
            background: linear-gradient(135deg, #34d399, #10b981);
            color: #ffffff;
            flex: 0 0 auto;
        }

        #${SUBMISSION_CONFETTI_ID} {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 2147483646;
            overflow: hidden;
        }

        #${SUBMISSION_CONFETTI_ID} .confetti-piece {
            position: absolute;
            top: -16px;
            width: var(--size);
            height: calc(var(--size) * 1.4);
            left: var(--left);
            background: var(--color);
            border-radius: 999px;
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(var(--rotate));
            animation: aogaku-noodle-confetti-fall var(--duration) ease-out forwards;
        }

        @keyframes aogaku-noodle-confetti-fall {
            0% {
                opacity: 0;
                transform: translate3d(0, 0, 0) rotate(var(--rotate));
            }
            10% {
                opacity: 1;
            }
            100% {
                opacity: 0;
                transform: translate3d(var(--drift), 110vh, 0) rotate(calc(var(--rotate) + 720deg));
            }
        }
    `;

    document.head.appendChild(style);
}
