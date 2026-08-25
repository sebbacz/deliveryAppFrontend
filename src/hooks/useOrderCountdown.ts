// Shows the time remaining in the 5-minute decision window for PENDING_DECISION orders.
import { useState, useEffect } from "react";

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function useOrderCountdown(createdAt: string): string {
    const [remaining, setRemaining] = useState(() => {
        const elapsed = Date.now() - new Date(createdAt).getTime();
        return Math.max(0, WINDOW_MS - elapsed); //  it never goes negative
    });

    useEffect(() => {
        if (remaining <= 0) return; // no need to tick once the window has expired
        const id = setInterval(() => {
            const elapsed = Date.now() - new Date(createdAt).getTime();
            setRemaining(Math.max(0, WINDOW_MS - elapsed));
        }, 1000); // update every second for a live countdown
        return () => clearInterval(id); // cleanup
    }, [createdAt, remaining]);

    if (remaining <= 0) return "Auto-declining..."; // backend will decline shortly
    const secs = Math.ceil(remaining / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")} left`; // eg soem time left
}
