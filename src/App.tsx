import { useEffect, useState } from 'react'
import './App.css'
import ConnectionDialog from './components/connectionDialog';
import ldrImgURL from '@/assets/ldr.png'
function App() {
  const [audrinoIP, setAudrinoIP] = useState('-');
  const [connectionDialogIsOpen, setConnectionDialogIsOpen] = useState(false);
  useEffect(() => {
    if (audrinoIP == "-") {
      setConnectionDialogIsOpen(true);
    }
  })

  function handleOpenChange(open: boolean) {
    setConnectionDialogIsOpen(open);
  }

  function handleSetAudrinoIp(ip: string) {
    console.log("Audrino IP set to: " + ip);
    setAudrinoIP(ip);
    setConnectionDialogIsOpen(false);
  }

  return (
    <>
      <div className="">Solar Tracker Project</div>
      {/* progress bar. "resetting to sunrise position in Xs" */}
      {/* Voltage across solar panel
Voltage across battery(?) */}
      {/* reset to sunrise position */}
      <div className="grid grid-rows-2 grid-cols-2">
        <img src={ldrImgURL} />
        <img src={ldrImgURL} />
        <img src={ldrImgURL} />
        <img src={ldrImgURL} />
      </div>
      <ConnectionDialog open={connectionDialogIsOpen} onChange={handleOpenChange} callback={handleSetAudrinoIp} />
    </>
  )
}

export default App
