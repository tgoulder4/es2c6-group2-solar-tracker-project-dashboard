
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

function App() {
  const [audrinoIP, setAudrinoIP] = useState("");
  const [connectionDialogIsOpen, setConnectionDialogIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<TrackerData | null>(null)

  // useEffect(() => {
  //   if (audrinoIP == "") {
  //     setConnectionDialogIsOpen(true);
  //   }
  // }, []);

  useEffect(() => {
    async function track() {
      const data = await fetchData(audrinoIP);
      const avgAndDiff = getAveragesAndDiffs(data.ldrValues);
      setData(data);
      const changes = getChanges({ ...avgAndDiff, ePos: data.ePos, rPos: data.rPos });
      await setChanges(audrinoIP, changes);
    };
    setTimeout(() => {
      if (audrinoIP) { track(); }
    }, 1000);
  })

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
    console.log("Audrino IP set to: " + ip);
    setAudrinoIP(ip);
    const res = await fetch("http://" + ip + "/data");
    if (res.ok) {
      const body = await res.json();

      console.log("trackerData: " + JSON.stringify(body));
      const trackerData = parseTrackerData(body);
      setData(trackerData);
      setConnectionDialogIsOpen(false);
    }
    if (res.ok) {
    } else {
      setError("Couldn't connect to this IP -- res: " + String(res));
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
          </div>
          <div className="flex flex-col gap-4 w-full items-start">
            <div className="time"></div>
            <div className="flex gap-2">
              <Button variant={'outline'} onClick={() => handleSearch()}>Search for source</Button>
              <Button variant={'outline'} onClick={() => handleResetToSunrise()}>Reset to sunrise</Button>
            </div>
          </div>

        </div>

        <div className="bg-gray-200 h-full w-[1px] rounded-full"></div>
        <div className="rhs flex-2 flex flex-col items-start justify-between gap-8 pl-10">
          <div className="grid gap-4 grid-rows-2 grid-cols-2 w-[50%] min-w-48 max-w-64 aspect-square">
            <Circle fill={`${data?.ldrValues ? "transparent" : "#e5e7eb"}`} className={`w-full h-full stroke-2 stroke-gray-200 ${!data?.ldrValues && "animate animate-pulse"}`} opacity={"10%"}>{data?.ldrValues[0] || ""}</Circle>
            <Circle fill={`${data?.ldrValues ? "transparent" : "#e5e7eb"}`} className={`w-full h-full stroke-2 stroke-gray-200 ${!data?.ldrValues && "animate animate-pulse"}`} opacity={"10%"}>{data?.ldrValues[1] || ""}</Circle>
            <Circle fill={`${data?.ldrValues ? "transparent" : "#e5e7eb"}`} className={`w-full h-full stroke-2 stroke-gray-200 ${!data?.ldrValues && "animate animate-pulse"}`} opacity={"10%"}>{data?.ldrValues[2] || ""}</Circle>
            <Circle fill={`${data?.ldrValues ? "transparent" : "#e5e7eb"}`} className={`w-full h-full stroke-2 stroke-gray-200 ${!data?.ldrValues && "animate animate-pulse"}`} opacity={"10%"}>{data?.ldrValues[3] || ""}</Circle>
          </div>

          <div className="flex flex-col justify-end flex-3 w-full description text-left">
            <h1 className="status text-3xl font-bold mb-4">Status</h1>
            <div className="h-px w-full bg-gray-200 mb-4"></div>
            <div className="flex flex-row gap-8 bg-gray-100 rounded-md p-4">

              <div className="solar-v">Solar V</div>
            </div>
          </div>
        </div>
      </div>
      <ConnectionDialog error={error} open={connectionDialogIsOpen} onChange={handleOpenChange} callback={handleSetAudrinoIp} />
    </>
  )
}

export default App
