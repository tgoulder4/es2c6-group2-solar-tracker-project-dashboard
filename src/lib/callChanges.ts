import type { AvgAndDiff, TrackerData, TrackerState } from "./types";

export function getChanges(s: TrackerState): {
    newEPos?: number | undefined;
    newRPos?: number | undefined;
} {
    const { eDiff, ePos, rDiff, rPos } = s;
    let changes: { newEPos?: number, newRPos?: number } = {};
    if (eDiff > 0 && ePos < 180) {
        changes['newEPos'] = ePos + 5;
    } else if (eDiff < 0 && ePos > -180) {
        changes['newEPos'] = ePos - 5;
    }

    if (rDiff > 0 && rPos < 180) {
        changes['newRPos'] = rPos + 5;
    } else if (rDiff < 0 && rPos > -180) {
        changes['newRPos'] = rPos - 5;
    }
    console.log("deltas: ePos: " + ePos + ", rPos: " + rPos);
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

export async function setChanges(ip: string, changes: { newEPos?: number, newRPos?: number }) {
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
    console.log("url: " + url);
    if (changes.newEPos) {
        const res = await fetch(url);
        if (!res.ok) {
            console.error("res was not OK");
        }
    }
}

