
import { useEffect, useState } from 'react'
import './App.css'
import ConnectionDialog from './components/connectionDialog';
import { Circle, Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import type { ReceivedData, TrackerData, TrackerState } from './lib/types';
import SolarTrackerModel from './components/solarTrackerModel';
import TrackerInfo from './components/TrackerInfo';
import { fetchData } from './lib/data';
import { getAveragesAndDiffs, getChanges, setChanges } from './lib/callChanges';
import Statistic from './components/statistic';
import BatteryGauge from 'react-battery-gauge';
import GaugeComponent from 'react-gauge-component';
import LDR from './components/LDR';
import { REFRESH_TIME } from './lib/constants';
import { getTrackerState } from './lib/ldrInterpretation';

function App() {
  const [audrinoIP, setAudrinoIP] = useState("");
  const [connectionDialogIsOpen, setConnectionDialogIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [minLDR, setMinLDR] = useState(0);
  const [maxLDR, setMaxLDR] = useState(10);
  const [uiState, setUiState] = useState<'Connecting' | 'Connected' | 'Disconnected' | 'Not Connected'>('Not Connected');
  const [trackerState, setTrackerState] = useState<TrackerState | null>(null);


  useEffect(() => {
    if (audrinoIP == "") {
      setConnectionDialogIsOpen(true);
    }
  }, []);

  useEffect(() => {
    //calculate the minimum and maximum LDR values for correct colour scales: with dark being the minimum value and yellow being the maximum value ONLY if the difference is greater than the threshold
    // it will be moving if the diff is > threshold
    if (!trackerState) { console.warn("trackerState is falsy so min and max couldn't be computed for visuals."); }
    if (trackerState) {
      setMinLDR(Math.min(...trackerState?.ldrValues || []));
      setMaxLDR(Math.max(...trackerState?.ldrValues || []));
    } else {
      setMinLDR(0);
      setMaxLDR(10);
    }
  })
  useEffect(() => {
    async function track() {
      let state: TrackerState;
      const received = await fetchData(audrinoIP);
      if (received) {
        //lets set the current state
        const newData = parseTrackerData(received);
        state = getTrackerState(newData);
        setTrackerState({ ...state });

        if (connectionDialogIsOpen) { setConnectionDialogIsOpen(false); };

        //now lets get and call the changes
        const changes = getChanges(state);
        await setChanges(audrinoIP, changes);

      } else {
        if (trackerState) {
          if (
            uiState == "Connected"
          ) {
            setUiState('Disconnected');
          } else if (uiState == "Connecting" || uiState == "Disconnected") {
            setUiState('Not Connected');
          }
        }
      };
    };
    const id = setInterval(() => {
      if (audrinoIP) {
        setRefreshing(true);
        track().then(() => {
          setRefreshing(false);
        })
      }
    }, REFRESH_TIME);
    return (() => {
      clearInterval(id);
    })
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
    setUiState('Connecting');
    try {
      const received = await fetchData(ip);
      if (received) {
        setAudrinoIP(ip);
        setConnectionDialogIsOpen(false);
        setUiState('Connected');
      } else {
        setError("Couldn't connect to that IP.");
      }
    } catch (e) {
      setError(String(e));
      setUiState('Not Connected');
    }
  }

  function parseTrackerData(received: ReceivedData): TrackerData {
    console.log("parsetracker" + JSON.stringify(received))
    return ({
      ldrValues: [received.ldr1, received.ldr2, received.ldr3, received.ldr4],
      solarVoltage: received.solarV,
      batteryPercentage: received.batteryPerc,
      ePos: received.ePos,
      rPos: received.rPos,
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
                uiState !== 'Connected' ? <Button onClick={() => {
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
          <div className="grid gap-4 grid-rows-2 grid-cols-2 w-[50%] min-w-48 max-w-64 aspect-square">
            <LDR s={trackerState} minLDR={minLDR} maxLDR={maxLDR} value={trackerState?.ldrValues[0] || 0} />
            <LDR s={trackerState} minLDR={minLDR} maxLDR={maxLDR} value={trackerState?.ldrValues[1] || 0} />
            <LDR s={trackerState} minLDR={minLDR} maxLDR={maxLDR} value={trackerState?.ldrValues[2] || 0} />
            <LDR s={trackerState} minLDR={minLDR} maxLDR={maxLDR} value={trackerState?.ldrValues[3] || 0} />

          </div>

          <div className="flex flex-col justify-end flex-3 w-full description text-left">
            <div className="flex justify-between items-end mb-6">
              <div className="flex">
                {refreshing && <Loader2 className='animate animate-spin text-gray-400' />}
                <h1 className="status text-5xl font-bold">{uiState == "Connected" ? trackerState?.status : uiState}</h1>
              </div>
              <h2 className='text-xl text-gray-500'>
                δe: {trackerState?.eDiff}, δr: {trackerState?.rDiff}
              </h2>
            </div>
            <div className="h-px w-full bg-gray-200 mb-8"></div>
            <div className="flex flex-row gap-8 bg-gray-100 rounded-md gap-16 p-8 pl-16 pr-[2vw] text-2xl items-center h-40">
              <Statistic loading={uiState !== "Connected"} value={2} unit='V' name='Solar Cell' />
              <div className="w-px h-full bg-gray-300"></div>
              <Statistic loading={uiState !== "Connected"} value={10} unit='J' name='Energy Generated' />
              <div className="w-px h-full bg-gray-300"></div>
              <Statistic loading={uiState !== "Connected"} value={32} unit='' name='Adjustments Made' />
            </div>
          </div>
        </div>
      </div>
      <ConnectionDialog setError={setError} error={error} open={connectionDialogIsOpen} onChange={handleOpenChange} callback={handleSetAudrinoIp} />
    </>
  )
}

export default App
