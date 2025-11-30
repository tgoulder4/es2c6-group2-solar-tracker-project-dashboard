
import type { TrackerData } from "./types";

async function fetchData(espIp: string) {
    //fetch request to esp-ip/data
    const res = await fetch("http://" + espIp + "/data");
    const bodyText = await res.text();
    console.log("bodyText: " + bodyText);
    const bodyJson = JSON.parse(bodyText);
    console.log("bodyJson: " + bodyJson);
    return bodyJson as TrackerData
}

export { fetchData }