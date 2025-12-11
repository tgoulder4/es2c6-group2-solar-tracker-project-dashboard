//returns 
export function diffThreshold(avgSum: number) {
    //start: 8, end: 70 therefore . assume light.
    const hazy = false;
    const percentage = 50;
    const thresholdValue = (percentage / 100 * avgSum * 0.5 * (hazy ? 1.5 : 1));
    // - (85 / 11) //linear, assumng light (25-70, 200-475)
    // console.log("returning: " + thresholdValue + " for LDR value: " + avgSum);
    return thresholdValue;
}