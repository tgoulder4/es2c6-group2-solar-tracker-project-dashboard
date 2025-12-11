import React, { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import ArrowKeysReact from 'arrow-keys-react';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"


type Props = {
    ip: string,
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function ManualControlDialog({ ip, open, setOpen }: Props) {
    const [error, setError] = useState("");
    const [directionsDown, setDirectionsDown] = useState<('up' | 'down' | 'left' | 'right')[]>([]);
    async function sendDirection(direction: 'up' | 'down' | 'left' | 'right') {
        console.log("here");
        const r = await fetch("http://" + ip + '/' + direction);
        if (r.ok) {

        }
    }

    ArrowKeysReact.config({
        left: () => {
            if (directionsDown.find('left' as any)) { return; };
            sendDirection('left');
            setDirectionsDown([...directionsDown, 'left']);
        },
        right: () => {
            if (directionsDown.find('right' as any)) { return; };
            sendDirection('right');
            console.log('right key detected.');
        },
        up: () => {
            if (directionsDown.find('up' as any)) { return; };
            sendDirection('up');
            console.log('up key detected.');
        },
        down: () => {
            console.log('down key detected.');
            if (directionsDown.find('down' as any)) { return; };
            sendDirection('down');
        }
    });

    useEffect(() => {

    }, [])

    return (<>
        <Dialog open={open} onOpenChange={setOpen}>
            {/* <DialogTrigger>Open</DialogTrigger> */}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manual Navigation</DialogTitle>
                    {/* <DialogDescription> */}
                    <div {...ArrowKeysReact.events} tabIndex="1" className="arrows flex items-end flex-row gap-2">
                        <Button onClick={() => {

                        }} className="left">←</Button>
                        <div className="flex flex-col gap-2">
                            <Button className="up bg-black text-white">↑</Button>
                            <Button className="down">↓</Button>
                        </div>
                        <Button className="right">→</Button>
                    </div>
                    {/* </DialogDescription> */}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    </>
    )
}

export default ManualControlDialog