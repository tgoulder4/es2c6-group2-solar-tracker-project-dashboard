import React, { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { TESTING_AUDRINO_IP } from '@/lib/constants';

type Props = {
    open: boolean;
    onChange: (open: boolean) => void;
    callback: (input: string) => void;
    error: string;
    setError: Dispatch<SetStateAction<string>>;
}

function ConnectionDialog({ open, onChange, callback, error, setError }: Props) {
    const [value, setValue] = useState(TESTING_AUDRINO_IP);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        setConnecting(false);
    }, [error]);

    return (
        <Dialog open={open} onOpenChange={onChange}>
            {/* <DialogTrigger>Enter IP</DialogTrigger> */}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter the Tracker's IP Address to continue</DialogTitle>
                    <DialogDescription>
                        Please enter the IP address of the Solar Tracker.
                    </DialogDescription>
                    <p className='text-red-500'>{error}</p>
                    <Input defaultValue={TESTING_AUDRINO_IP} onChange={(e) => { setValue(e.target.value); setError(''); }} placeholder='Enter the IP' />
                    <Button disabled={connecting} className='mt-4' onClick={() => { setConnecting(true); callback(value); }}>
                        {connecting && <Loader2 className='animate animate-spin text-gray-200' />}
                        Confirm</Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default ConnectionDialog