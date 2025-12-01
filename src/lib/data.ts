
import type { ReceivedData, TrackerData } from "./types";

async function fetchData(espIp: string): Promise<ReceivedData | null> {
    //fetch request to esp-ip/data
    const res = await fetch("http://" + espIp + "/data");
    try {
        if (res.ok) {
            const bodyText = await res.text();
            console.log("bodyText: " + JSON.stringify(bodyText));
            const bodyJson: ReceivedData = JSON.parse(bodyText);
            console.log("bodyJson: " + JSON.stringify(bodyJson));
            return { ...bodyJson as ReceivedData };
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export { fetchData }