import React, { useState, type Dispatch, type SetStateAction } from 'react'
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

type Props = {
    open: boolean;
    onChange: (open: boolean) => void;
    callback: (input: string) => void;
    error: string;
    setError: Dispatch<SetStateAction<string>>;
}

function ConnectionDialog({ open, onChange, callback, error, setError }: Props) {
    const [value, setValue] = useState("");
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
                    <Input onChange={(e) => { setValue(e.target.value); setError(''); }} placeholder='Enter the IP' />
                    <Button className='mt-4' onClick={() => callback(value)}>Confirm</Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default ConnectionDialog