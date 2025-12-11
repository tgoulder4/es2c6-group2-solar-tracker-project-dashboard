
import { useEffect, useState } from 'react'
import './App.css'
import ConnectionDialog from './components/connectionDialog';
import { Keyboard, Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import type { ReceivedData, TrackerState } from './lib/types';
import TrackerInfo from './components/TrackerInfo';
import { fetchData } from './lib/data';
import { getChanges, applyChanges, getAveragesAndDiffs } from './lib/callChanges';
import Statistic from './components/statistic';
import BatteryGauge from 'react-battery-gauge';
import LDR from './components/LDR';
import { REFRESH_TIME, TESTING_AUDRINO_IP } from './lib/constants';
import ManualControlDialog from './components/manualControlDialog';
import { diffThreshold } from './project_testing/diff_threshold';
import ClockFlip from './components/Clock';

function App() {
  const [audrinoIP, setAudrinoIP] = useState('');
  const [connectionDialogIsOpen, setConnectionDialogIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [uiState, setUiState] = useState<'Connecting' | 'Connected' | 'Disconnected' | 'Not Connected' | 'Resetting to Sunrise...'>('Not Connected');
  const [ts, setTrackerState] = useState<TrackerState | null>(null);
  const [searching, setSearching] = useState(false);
  const [controlsDialogOpen, setControlsDialogOpen] = useState(false);
  const [requestedMovementInDir, setRequestedMovementInDir] = useState<{ e: -1 | 0 | 1, r: -1 | 0 | 1 }>({ e: 0, r: 0 });


  console.log("avg sum: " + ts?.avgSum);
  useEffect(() => {
    if (audrinoIP == "") {
      setConnectionDialogIsOpen(true);
    }
    else if (TESTING_AUDRINO_IP !== "") {
      handleSetAudrinoIp(TESTING_AUDRINO_IP);
    }
  }, []);


  useEffect(() => {
    console.log("uE called")
    let changes: {
      newEPos?: number | undefined;
      newRPos?: number | undefined;
    } = { newEPos: 0, newRPos: 0 };

    async function track() {
      console.log("track called")
      await fetchData(audrinoIP).then((d) => {
        if (d) {
          const state = parseTrackerData(d);
          setTrackerState(state);
          if (connectionDialogIsOpen) { setConnectionDialogIsOpen(false); };
        } else {
          if (ts) {
            if (
              uiState == "Connected"
            ) {
              setUiState('Disconnected');
            } else if (uiState == "Connecting" || uiState == "Disconnected") {
              setUiState('Not Connected');
            }
          }
        }
      })

      //lets set the current state
      //now lets get and call the changes ONLY if we should
      // if (state.status == "Tracking") {
      // changes = getChanges(state);
      // setAdj(adj++);
      // console.log("changes: " + JSON.stringify(changes))
      // await applyChanges(audrinoIP, changes).then(() => {
      //   ePos = changes.newEPos || ePos;
      //   rPos = changes.newRPos || rPos;
      //   console.log("ePos internal tracker: " + ePos);
      // }).then(() => {
      //   setTrackerState({ ...state, ePos, rPos })
      // })
      // }
      // } else {


    };
    const id = setInterval(() =>
    // useMemo(() => 
    {
      console.log("interval.   audrinoIP: " + audrinoIP)
      if (audrinoIP && !controlsDialogOpen) {
        setRefreshing(true);
        track().then(() => {
          setRefreshing(false);
          //adj is always 1 here. as when the interval was defined it takes a snapshot of the variables
          console.log("changes: " + JSON.stringify(changes));
          if (changes.newEPos) {
            if (changes.newRPos) {
              setRequestedMovementInDir({ e: changes.newEPos > 0 ? 1 : -1, r: changes.newRPos > 0 ? 1 : -1 });
            } else {
              setRequestedMovementInDir({ ...requestedMovementInDir, e: changes.newEPos > 0 ? 1 : -1 });
            }
          } else {
            if (changes.newRPos) {
              setRequestedMovementInDir({ ...requestedMovementInDir, r: changes.newRPos > 0 ? 1 : -1 });
            }
          }

          setTimeout(() => {
            setRequestedMovementInDir({ e: 0, r: 0 });
          }, 500);
        })
      }

      return (() => {
        clearInterval(id);
      });

      // }, [changes.newEPos, changes.newRPos, requestedMovementInDir.e, requestedMovementInDir.r]), REFRESH_TIME);
    }
      , REFRESH_TIME);
  }, []);

  function handleOpenChange(open: boolean) {
    setConnectionDialogIsOpen(open);
  }

  async function handleResetToSunrise() {
    if (ts) {
      setTrackerState({ ...ts, status: 'Resetting to Sunrise Position...' });
      const res = await fetch(audrinoIP + "/sunrise", {
        method: 'POST'
      });
      if (!res.ok) { setError("Couldn't send this request.") }
    }
  }

  async function handleSearch() {
    if (ts) {

      setSearching(true);
      const res = await fetch(audrinoIP + "/search", {
        method: 'POST'
      });
      if (!res.ok) { setError("Couldn't send this request.") } else {
        setTrackerState({ ...ts, status: 'Searching for Source...' });
      }
    }
  }

  async function handleSetAudrinoIp(ip: string) {
    //make an attempt to connect
    setUiState('Connecting');
    try {
      await fetchData(ip).then((res) => {
        if (res !== null) {
          setAudrinoIP(ip);
          setConnectionDialogIsOpen(false);
          setUiState('Connected');
        } else {
          setError("Couldn't connect.");
        }
      });
    } catch (e) {
      setError(String(e));
      setUiState('Not Connected');
    }
  }

  function parseTrackerData(d: ReceivedData): TrackerState {
    let parsed: any = {};
    parsed["ldrValues"] = [d.ldr1, d.ldr2, d.ldr3, d.ldr4];
    parsed["solarVoltage"] = d.solarV;
    parsed["batteryPercentage"] = d.batteryPerc;
    parsed["ePos"] = d.ePos;
    parsed["rPos"] = d.rPos;
    parsed["diffThresholdForThisSum"] = d.diffThresholdForThisSum;
    const { rDiff, eDiff, avgSum, avgBottom, avgLeft, avgRight, avgTop } = getAveragesAndDiffs(parsed.ldrValues);
    parsed["rDiff"] = rDiff;
    parsed["eDiff"] = eDiff;
    parsed["avgBottom"] = avgBottom;
    parsed["avgLeft"] = avgLeft;
    parsed["avgRight"] = avgRight;
    parsed["avgTop"] = avgTop;
    parsed["avgSum"] = avgSum;
    //if the diff is greater than threshold and prev state was 'tracking' then clearly still moving
    if (
      (Math.abs(eDiff) > diffThreshold(avgSum)) ||
      (Math.abs(rDiff) > diffThreshold(avgSum))
    ) {
      parsed["status"] = 'Tracking';
    } else if (
      (Math.abs(eDiff) <= diffThreshold(avgSum)) ||
      (Math.abs(rDiff) <= diffThreshold(avgSum))
    ) {
      parsed["status"] = 'Optimal';
    }
    return parsed as TrackerState;

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
            <BatteryGauge value={ts?.batteryPercentage || 100} size={100} />

            {refreshing && <Loader2 className='animate animate-spin text-gray-400' />}
          </div>
          <div className="flex flex-col gap-4 w-full items-start">
            <div className="time"></div>
            <div className="flex gap-2 mb-4">
              <Button variant={'outline'} onClick={() => { setControlsDialogOpen(true) }} className=""><Keyboard /></Button>
              {
                uiState !== 'Connected' ? <Button onClick={() => {
                  setConnectionDialogIsOpen(true);
                }}>Enter Audrino IP</Button> : <>
                  <Button disabled={searching} variant={'outline'} onClick={() => { handleSearch().then(() => ts && setTrackerState({ ...ts, status: 'Tracking' })); }}>
                    {searching && <Loader2 className='animate animate-spin text-gray-400' />}
                    Search for source</Button>
                  <Button disabled={ts?.status == "Resetting to Sunrise Position..."} variant={'outline'} onClick={() => { handleResetToSunrise().then(() => ts && setTrackerState({ ...ts, status: 'Waiting for Sunrise...' })); }}>
                    {ts?.status == "Resetting to Sunrise Position..." && <Loader2 className='animate animate-spin text-gray-400' />}
                    Reset to sunrise</Button>
                </>
              }
            </div>
            {error && <p className='text-red-500'>{error}</p>}
          </div>

        </div>

        <div className="bg-gray-200 h-full w-[1px] rounded-full"></div>
        <div className="rhs flex-2 flex flex-col items-start justify-between gap-8 pl-10">
          <div className="grid gap-4 grid-rows-2 grid-cols-2 w-[50%] min-w-48 max-w-64 aspect-square">
            <LDR s={ts} representsLdrPosition={0} />
            <LDR s={ts} representsLdrPosition={1} />
            <LDR s={ts} representsLdrPosition={3} />
            <LDR s={ts} representsLdrPosition={2} />
          </div>

          <div className="flex flex-col justify-end flex-3 w-full description text-left">
            <div className="flex justify-between items-end mb-6">
              <div className="flex">
                <h1 className={`status text-5xl font-bold ${uiState == "Connected" && (ts?.status == undefined && "text-green-800")}`}>{(uiState == "Connected" ? ((ts?.status == undefined) ? "Connected" : ts.status) : uiState)}</h1>
                {/* Tracking element is above */}
                <div className="dir">
                  {/* assumption */}
                  {requestedMovementInDir.e == 1 && <p className='text-red-500'>UP</p>}
                  {requestedMovementInDir.e == -1 && <p className='text-red-500'>DOWN</p>}
                  {requestedMovementInDir.r == 1 && <p className='text-red-500'>LEFT</p>}
                  {requestedMovementInDir.r == -1 && <p className='text-red-500'>RIGHT</p>}
                </div>
              </div>
              <div className="flex gap-2 items-center">

                <h2 className='text-xs text-gray-500'>
                  δe: {ts?.eDiff.toFixed(0)}, δr: {ts?.rDiff.toFixed(0)}, e: {ts?.ePos.toFixed(0)}, r: {ts?.rPos.toFixed(0)}, Avg: t: {ts?.avgTop.toFixed(0)}, r: {ts?.avgRight.toFixed(0)}, b: {ts?.avgBottom.toFixed(0)}, l: {ts?.avgLeft.toFixed(0)}, Threshold LDR Value: {diffThreshold(ts?.avgSum || 0).toFixed(0)}
                </h2>
              </div>
            </div>
            <div className="h-px w-full bg-gray-200 mb-8"></div>
            <div className="flex flex-row gap-8 bg-gray-100 rounded-md gap-16 p-8 pl-16 pr-[2vw] text-2xl items-center h-40">
              <Statistic loading={uiState !== "Connected"} value={Number(ts?.solarVoltage.toFixed(1)) || 0} unit='V' name='Solar Cell' />
              <div className="w-px h-full bg-gray-300"></div>
              <Statistic loading={uiState !== "Connected"} value={10} unit='J' name='Energy Generated' />
              <div className="w-px h-full bg-gray-300"></div>
              {/* <ClockFlip /> */}
            </div>
          </div>
        </div>
      </div>
      <ConnectionDialog setError={setError} error={error} open={connectionDialogIsOpen} onChange={handleOpenChange} callback={handleSetAudrinoIp} />
      <ManualControlDialog ip={audrinoIP} open={controlsDialogOpen} setOpen={setControlsDialogOpen} />
    </>
  )
}

export default App
