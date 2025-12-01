
import type { TrackerData } from "./types";

async function fetchData(espIp: string) {
    //fetch request to esp-ip/data
    try {
        const res = await fetch("http://" + espIp + "/data");
        if (res.ok) {
            const bodyText = await res.text();
            console.log("bodyText: " + bodyText);
            const bodyJson = JSON.parse(bodyText);
            console.log("bodyJson: " + bodyJson);
            return bodyJson as TrackerData
        } else {
            console.error("res was not OK");
            return false;
        }
    } catch (e) {
        console.error(e);
        return false;
    }
}

export { fetchData }