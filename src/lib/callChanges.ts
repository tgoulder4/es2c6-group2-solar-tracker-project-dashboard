import { DELTA } from "./constants";
import type { AvgAndDiff, TrackerData, TrackerState } from "./types";

export function getChanges(s: TrackerState): {
    newEPos?: number | undefined;
    newRPos?: number | undefined;
} {
    const { eDiff, ePos, rDiff, rPos } = s;
    let changes: { newEPos?: number, newRPos?: number } = {};
    //make delta proportional to the difference between the threshold diff and the diff. 
    //treat 90 as 0
    if (eDiff > 0 && ePos < 180 - DELTA) {

        changes['newEPos'] = ePos + DELTA;
    } else if (eDiff < 0 && ePos >= DELTA) {
        changes['newEPos'] = ePos - DELTA;
    }

    if (rDiff > 0 && rPos < 180 - DELTA) {
        changes['newRPos'] = rPos + DELTA;
    } else if (rDiff < 0 && rPos >= DELTA) {
        changes['newRPos'] = rPos - DELTA;
    }
    return changes;
}

export function getAveragesAndDiffs(ldrValues: TrackerData['ldrValues']): AvgAndDiff {
    const valueLDR1 = ldrValues[0];
    const valueLDR2 = ldrValues[1];
    const valueLDR3 = ldrValues[2];
    const valueLDR4 = ldrValues[3];

    const avgTop = (valueLDR1 + valueLDR2) / 2;
    const avgBottom = (valueLDR3 + valueLDR4) / 2;
    const avgLeft = (valueLDR1 + valueLDR4) / 2;
    const avgRight = (valueLDR2 + valueLDR3) / 2;
    const avgSum = (avgTop + avgBottom + avgLeft + avgRight) / 4;

    const eDiff = avgTop - avgBottom;
    const rDiff = avgLeft - avgRight;
    return { avgTop, avgBottom, avgLeft, avgRight, avgSum, eDiff, rDiff }
}

export async function applyChanges(ip: string, changes: { newEPos?: number, newRPos?: number }) {
    let url = "http://" + ip + "/set";
    if (changes.newEPos) {
        url = url + '?e=' + changes.newEPos;
        if (changes.newRPos) {
            url = url + '&r=' + changes.newRPos;
        }
    } else {
        if (changes.newRPos) {
            url = url + '?r=' + changes.newRPos;
        }
    }
    // console.log("url: " + url);
    // if (typeof changes.newEPos !== undefined || typeof changes.newRPos !== undefined) {
    const res = await fetch(url, {
        method: 'POST', headers: [
            ["Content-Type", "application/x-www-form-urlencoded"],
            // ["Retry-After", "2"]
        ]
    });
    if (!res.ok) {
        console.error("res was not OK");
    }
    // }
}

