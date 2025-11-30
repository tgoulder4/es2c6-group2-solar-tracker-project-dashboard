import type { AvgAndDiff, TrackerData, TrackerState } from "./types";

export function getChanges(props: { eDiff: number, ePos: number, rDiff: number, rPos: number }) {
    const { eDiff, ePos, rDiff, rPos } = props;
    let changes: any = {};
    if (eDiff > 0 && ePos < 180) {
        changes['ePos'] = ePos + 5;
    } else if (eDiff < 0 && ePos > -180) {
        changes['ePos'] = ePos - 5;
    }

    if (rDiff > 0 && rPos < 180) {
        changes['rPos'] = rPos + 5;
    } else if (rDiff < 0 && rPos > -180) {
        changes['rPos'] = rPos - 5;
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

export async function setChanges(ip: string, changes: Pick<TrackerState, 'ePos' | 'rPos'>) {
    let url = "http://" + ip + "/set";
    if (changes.ePos) {
        url = url + '?e=' + changes.ePos;
        if (changes.rPos) {
            url = url + '&r=' + changes.rPos;
        }
    } else {
        if (changes.rPos) {
            url = url + '?r=' + changes.rPos;
        }
    }
    console.log("url: " + url);
    if (changes.ePos) {
        const res = await fetch(url);
        if (!res.ok) {
            console.error("res was not OK");
        }
    }
}

