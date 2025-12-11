import React from 'react'

type Props = {
    value: number,
    unit: string,
    name: string,
    loading?: boolean
}

function Statistic({ value, unit, name, loading }: Props) {
    return (
        <div className={`stat flex flex-col gap-4`}>
            <div className="flex flex-row items-end gap-2">
                {
                    loading ? <>
                        <div className="w-[70px] h-[45px] bg-gray-200 animate animate-pulse rounded-md"></div>
                        <div className="w-[20px] h-[20px] bg-gray-200 animate animate-pulse rounded-md"></div>

                    </> :
                        <>
                            <p className='text-5xl'>{value}</p>
                            <p className='text-2xl'>{unit}</p>
                        </>
                }
            </div>
            {loading ?
                <div className="w-[100px] h-[20px] bg-gray-200 animate animate-pulse rounded-md"></div>
                :
                <p className="solar-v text-xl">{name}</p>
            }

        </div>
    )
}

export default Statistic