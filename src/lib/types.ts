

export type ReceivedData = {
    solarV: number,
    batteryPerc: number,
    eDiff: number,
    rDiff: number,
    ePos: number,
    rPos: number,
    ldr1: number,
    ldr2: number,
    ldr3: number,
    ldr4: number,
    diffThresholdForThisSum: number
}

export type TrackerState = {
    solarVoltage: number,
    batteryPercentage: number,
    eDiff: number,
    rDiff: number,
    ldrValues: number[],
    ePos: number,
    rPos: number,
    avgTop: number,
    avgRight: number,
    avgBottom: number,
    avgLeft: number,
    avgSum: number,
    diffThresholdForThisSum: number,
    status: "Tracking" | 'Optimal' | 'Waiting for Sunrise...' | 'Searching for Source...' | 'Resetting to Sunrise Position...'
}

export type AvgAndDiff = {
    avgTop: number;
    avgBottom: number;
    avgLeft: number;
    avgRight: number;
    avgSum: number;
    eDiff: number;
    rDiff: number;
}