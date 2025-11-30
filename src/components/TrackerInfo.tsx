import { Canvas } from '@react-three/fiber'
import React, { Suspense } from 'react'
import SolarTrackerModel from './solarTrackerModel'
import modelSSUrl from '/model-ss.png'
// OrbitControls

type Props = {}

function TrackerInfo({ }: Props) {
    return (
        <div className="content-div">
            {/* <Canvas camera={{ position: [0, 10, 500] }}>
                <Suspense fallback={null}>
                    <SolarTrackerModel />
                </Suspense>
            </Canvas> */}
            <img className='max-w-36' src={modelSSUrl} />
        </div>
    )
}

export default TrackerInfo