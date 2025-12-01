import type { TrackerData, TrackerState } from '@/lib/types'
import { Circle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ColorScale from 'color-scales';

type Props = {
    value: number,
    minLDR: number,
    maxLDR: number,
    s: TrackerState | null
}

function LDR({ value, minLDR, maxLDR, s }: Props) {
    const [scale, setScale] = useState<ColorScale>(new ColorScale(minLDR, maxLDR, ['#3D3D3D', '#FFCD05'], 1));
    const [colorLux, setColorLux] = useState(0);
    useEffect(() => {
        setScale(new ColorScale(minLDR, maxLDR, ['#3D3D3D', '#FFCD05'], 1));
        setColorLux((0.2126 * scale.getColor(value).r) + (0.7152 * scale.getColor(value).g) + (0.0722 * scale.getColor(value).b));
        console.log("lux: " + colorLux);
    }, [minLDR, maxLDR]);
    return (
        <div className="ldr grid place-items-center relative">
            <Circle fill={`${s ? scale.getColor(value).toHexString() : "#efefef"}`} className={`grid place-items-center w-full h-full stroke-1 stroke-gray-100 ${!s && "stroke-gray-200"} ${(value !== maxLDR || !s) && 'animate animate-pulse'} text-black`}></Circle>
            {/* accessible text as per https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color */}
            <p className={`absolute font-bold ${colorLux > 186 ? 'text-black' : 'text-white'}`}>{
                value
                || ""}</p>
        </div>
    )
}

export default LDR