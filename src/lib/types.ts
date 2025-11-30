export type TrackerData = {
    //data received from the tracker
    solarVoltage: number,
    batteryPercentage: number,
    ldrValues: number[],
    ePos: number,
    rPos: number,
}

export type TrackerState = {
    solarVoltage: number,
    batteryPercentage: number,
    eDiff: number,
    rDiff: number,
    ldrValues: number[],
    ePos: number,
    rPos: number,
    status: string
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