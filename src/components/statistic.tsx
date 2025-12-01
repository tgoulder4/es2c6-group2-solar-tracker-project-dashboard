import React from 'react'

type Props = {
    value: number,
    unit: string,
    name: string
}

function Statistic({ value, unit, name }: Props) {
    return (
        <div className={`stat flex flex-col gap-4 ${value == 0 && 'opacity-0'}`}>
            <div className="flex flex-row items-end gap-2">
                <p className='text-5xl'>{value}</p>
                <p className='text-2xl'>{unit}</p>
            </div>
            <div className="solar-v">{name}</div>
        </div>
    )
}

export default Statistic