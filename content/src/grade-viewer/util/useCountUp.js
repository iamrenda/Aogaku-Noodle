import { useEffect, useState } from "react";

// Animates from 0 up to `target` (a number|null) using an ease-out curve.
// Returns null immediately when target isn't a finite number.
export function useCountUp(target, duration = 900) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (typeof target !== "number" || !Number.isFinite(target)) {
            setValue(null);
            return undefined;
        }

        setValue(0);

        let frameId;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(target * eased);

            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
            } else {
                setValue(target);
            }
        };

        frameId = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frameId);
    }, [target, duration]);

    return value;
}

export default useCountUp;
