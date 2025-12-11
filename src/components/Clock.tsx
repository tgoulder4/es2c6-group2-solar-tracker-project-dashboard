import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import { useEffect, useState } from "react";

export default function ClockFlip() {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const to = now + 24 * 60 * 60 * 1000;  // 24 hours from now

    return (
        <FlipClockCountdown
            to={to}
            now={() => now}
            renderMap={[false, true, true, true]} // show H:M:S
            labels={["", "Hours", "Minutes", "Seconds"]}
            hideOnComplete={false}
        />
    );
}
