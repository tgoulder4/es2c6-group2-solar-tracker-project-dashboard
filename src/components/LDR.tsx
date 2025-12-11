import type { TrackerState } from '@/lib/types'
import { Circle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ColorScale from 'color-scales';
import { diffThreshold } from '@/project_testing/diff_threshold';

type Props = {
    s: TrackerState | null,
    representsLdrPosition: number
}

function LDR({ s, representsLdrPosition }: Props) {
    const [colorLux, setColorLux] = useState(0);
    const [value, setValue] = useState(s?.ldrValues[representsLdrPosition] || 0);
    //the colour must be relative to the global max. 
    const [threshold, setThreshold] = useState(diffThreshold(s?.avgSum || 0));
    const [scale, setScale] = useState<ColorScale | null>(null);
    const [localMax, setLocalMax] = useState(null);
    // console.log("globalMaxLDR: " + globalMaxLDR);


    useEffect(() => {
        const newThresold = diffThreshold(s?.avgSum || 0);
        const newAvgSum = s?.avgSum || 1024;
        setThreshold(newThresold);
        const newLocalMax = Math.max(...s?.ldrValues || [1024]);
        const newScale = new ColorScale(newThresold, newLocalMax, ['#3D3D3D', '#FFCD05'], 1);
        setScale(newScale);
        setValue(s?.ldrValues[representsLdrPosition] || 0);
        //We changed the colour distribution to be non-linear to make the changes clearer
        setColorLux((0.2126 * newScale.getColor(value).r) + (0.7152 * newScale.getColor(value).g) + (0.0722 * newScale.getColor(value).b));
        // console.log("lux: " + colorLux);
    }, [s?.avgSum]);
    return (
        <div className="ldr grid place-items-center relative">
            {/* <p className='underline'>{representsLdrPosition}</p> */}
            <Circle fill={`${s ? scale?.getColor(value).toHexString() : "#efefef"}`} className={`grid place-items-center w-full h-full stroke-1 stroke-gray-100 ${!s && "stroke-gray-200"} ${(value !== localMax || !s) && 'animate animate-pulse '} text-black`}></Circle>
            <p className={`absolute font-bold ${colorLux > 186 ? 'text-black' : 'text-white'}`}>{value}</p>
        </div>
    )
}

export default LDR
/* accessible text as per https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color */