export type TrackerData = {
    //data received from the tracker
    solarVoltage: number,
    batteryPercentage: number,
    ldrValues: number[],
    ePos: number,
    rPos: number,
}

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
}

export type TrackerState = {
    solarVoltage: number,
    batteryPercentage: number,
    eDiff: number,
    rDiff: number,
    ldrValues: number[],
    ePos: number,
    rPos: number,
    status: "Tracking" | 'Reached Optimal Position' | 'Waiting for Sunrise...' | 'Searching for Source...'
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