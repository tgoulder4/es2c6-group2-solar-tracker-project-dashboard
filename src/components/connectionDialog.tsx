import React, { useState, type SetStateAction } from 'react'
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
}

function ConnectionDialog({ open, onChange, callback, error }: Props) {
    const [value, setValue] = useState("");
    return (
        <Dialog open={open} onOpenChange={onChange}>
            {/* <DialogTrigger>Enter IP</DialogTrigger> */}
            <DialogContent>
                <DialogHeader>
                    <p className='text-red'>{error}</p>
                    <DialogTitle>Enter the IP Address To Continue</DialogTitle>
                    <DialogDescription>
                        Please enter the IP address of the Solar Tracker.
                    </DialogDescription>
                    <Input onChange={(e) => setValue(e.target.value)} placeholder='Enter the IP' />
                    <Button onClick={() => callback(value)}>Confirm</Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default ConnectionDialog