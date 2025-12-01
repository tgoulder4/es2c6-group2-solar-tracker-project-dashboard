
import { useEffect, useState } from 'react'
import './App.css'
import ConnectionDialog from './components/connectionDialog';
import { Circle, Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import type { TrackerData } from './lib/types';
import SolarTrackerModel from './components/solarTrackerModel';
import TrackerInfo from './components/TrackerInfo';
import { fetchData } from './lib/data';
import { getAveragesAndDiffs, getChanges, setChanges } from './lib/callChanges';
import Statistic from './components/statistic';
import BatteryGauge from 'react-battery-gauge';
import GaugeComponent from 'react-gauge-component';

function App() {
  const [audrinoIP, setAudrinoIP] = useState("");
  const [connectionDialogIsOpen, setConnectionDialogIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<TrackerData & { connectionState: string }>({
    batteryPercentage: 0, ePos: 0, ldrValues: [0, 0, 0, 0], rPos: 0, solarVoltage: 0, connectionState: 'Not Connected'
  })
  const connected = data.connectionState !== 'Not Connected' && data.connectionState !== 'Connecting'

  useEffect(() => {
    if (audrinoIP == "") {
      setConnectionDialogIsOpen(true);
    }
  }, []);

  useEffect(() => {
    async function track() {
      const res = await fetchData(audrinoIP);
      if (res) {
        const avgAndDiff = getAveragesAndDiffs(data.ldrValues);
        setData({ ...data, connectionState: 'Connected' });
        const changes = getChanges({ ...avgAndDiff, ePos: data.ePos, rPos: data.rPos });
        await setChanges(audrinoIP, changes);

        if (connectionDialogIsOpen) { setConnectionDialogIsOpen(false); };
      } else {
        setData({
          ...data, connectionState: 'Not Connected'
        })
      }
    };
    setTimeout(() => {
      if (audrinoIP) {
        setRefreshing(true);
        track().then(() => {
          setRefreshing(false);
        })
      }
    }, 1000);
  }, [audrinoIP]);

  function handleOpenChange(open: boolean) {
    setConnectionDialogIsOpen(open);
  }

  async function handleResetToSunrise() {
    await fetch(audrinoIP + "/sunrise", {
      method: 'POST'
    })
  }

  async function handleSearch() {
    await fetch(audrinoIP + "/search", {
      method: 'POST'
    })
  }

  async function handleSetAudrinoIp(ip: string) {
    //make an attempt to connect
    setData({ ...data, connectionState: 'Connecting...' });
    const res = await fetchData(audrinoIP);
    if (res) {
      setAudrinoIP(ip);
      setConnectionDialogIsOpen(false);
      setData({ ...data, connectionState: 'Connected' });
    } else {
      setError("Couldn't connect to that IP.");
      setData({ ...data, connectionState: 'Not Connected' });
    }
  }
  function parseTrackerData(tr: any): TrackerData {
    return ({
      ldrValues: [tr.ldr1, tr.ldr2, tr.ldr3, tr.ldr4],
      solarVoltage: tr.solarV,
      batteryPercentage: tr.batteryPerc,
      ePos: tr.ePos,
      rPos: tr.rPos,
    })
  }

  return (
    <>
      <div className="flex flex-row w-full h-screen p-[50px]">
        {/* for development */}
        {/* <div className="">
          {String(data)}
        </div> */}
        <div className="lhs pr-[40px] flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-8">
            <TrackerInfo />
            <h1 className="text-left text-3xl">Solar Tracker</h1>
            <BatteryGauge value={10} size={100} />
          </div>
          <div className="flex flex-col gap-4 w-full items-start">
            <div className="time"></div>
            <div className="flex gap-2 mb-4">
              {
                !connected ? <Button onClick={() => {
                  setConnectionDialogIsOpen(true);
                }}>Enter Audrino IP</Button> : <>
                  <Button variant={'outline'} onClick={() => handleSearch()}>Search for source</Button>
                  <Button variant={'outline'} onClick={() => handleResetToSunrise()}>Reset to sunrise</Button>
                </>
              }
            </div>
          </div>

        </div>

        <div className="bg-gray-200 h-full w-[1px] rounded-full"></div>
        <div className="rhs flex-2 flex flex-col items-start justify-between gap-8 pl-10">
          <div className="grid gap-4 grid-rows-2 grid-cols-2 w-[50%] min-w-48 max-w-80 aspect-square">
            <div className="ldr relative">
              <Circle fill={`${connected ? "transparent" : "#e5e7eb"}`} className={`grid place-items-center w-full h-full stroke-2 stroke-gray-600 ${!connected && "stroke-gray-200 animate animate-pulse"}`} opacity={"10%"}>{data?.ldrValues[0] || ""}
                <GaugeComponent
                  type="grafana"
                  className='absolute'
                  arc={{
                    colorArray: ['#00FF15', '#FF2121'],
                    padding: 0.02,
                    subArcs:
                      [
                        { limit: 40 },
                        { limit: 60 },
                        { limit: 70 },
                        {},
                        {},
                        {},
                        {}
                      ]
                  }}
                  pointer={{ type: "blob", animationDelay: 0 }}
                  style={{ width: '20vw', height: '20vw' }}
                  value={50}
                />
              </Circle>
            </div>
            <Circle fill={`${connected ? "transparent" : "#e5e7eb"}`} className={`w-full h-full stroke-2 stroke-gray-600 ${!connected && "stroke-gray-200 animate animate-pulse"}`} opacity={"10%"}>{data?.ldrValues[1] || ""}</Circle>
            <Circle fill={`${connected ? "transparent" : "#e5e7eb"}`} className={`w-full h-full stroke-2 stroke-gray-600 ${!connected && "stroke-gray-200  animate animate-pulse"}`} opacity={"10%"}>{data?.ldrValues[2] || ""}</Circle>
            <Circle fill={`${connected ? "transparent" : "#e5e7eb"}`} className={`w-full h-full stroke-2 stroke-gray-600 ${!connected && "stroke-gray-200  animate animate-pulse"}`} opacity={"10%"}>{data?.ldrValues[3] || ""}</Circle>
          </div>

          <div className="flex flex-col justify-end flex-3 w-full description text-left">
            <div className="flex justify-between items-end mb-6">
              <div className="flex">
                {refreshing && <Loader2 className='animate animate-spin text-gray-400' />}
                <h1 className="status text-5xl font-bold">{data.connectionState == "Connected" ? "Tracking" : data.connectionState}</h1>
              </div>
              <h2 className='text-xl text-gray-500'>
                Stats: eDiff,rDiff
              </h2>
            </div>
            <div className="h-px w-full bg-gray-200 mb-8"></div>
            <div className="flex flex-row gap-8 bg-gray-100 rounded-md gap-16 p-8 pl-16 pr-64 text-2xl">
              <Statistic loading={data.connectionState !== "Connected"} value={10} unit='V' name='Solar Cell' />
              <div className="w-px h-full bg-gray-300"></div>
              <Statistic loading={data.connectionState !== "Connected"} value={10} unit='J' name='Energy Generated' />
              <div className="w-px h-full bg-gray-300"></div>
              <Statistic loading={data.connectionState !== "Connected"} value={62} unit='' name='Adjustments Made' />
            </div>
          </div>
        </div>
      </div>
      <ConnectionDialog setError={setError} error={error} open={connectionDialogIsOpen} onChange={handleOpenChange} callback={handleSetAudrinoIp} />
    </>
  )
}

export default App
