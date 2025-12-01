import { getAveragesAndDiffs } from "./callChanges";
import { DIFF_THRESHOLD } from "./constants";
import type { TrackerData, TrackerState } from "./types";

export function getTrackerState(d: TrackerData): TrackerState {
    const avgAndDiff = getAveragesAndDiffs(d.ldrValues);
    let status: TrackerState['status'] = 'Searching for Source...';
    //if the diff is greater than threshold and prev state was 'tracking' then clearly still moving
    if (
        (Math.abs(avgAndDiff.eDiff) > DIFF_THRESHOLD) ||
        (Math.abs(avgAndDiff.rDiff) > DIFF_THRESHOLD)
    ) {
        status = 'Tracking'
    } else {
        status = 'Reached Optimal Position'
    }
    return ({
        ...d, status, ...avgAndDiff
    })
}