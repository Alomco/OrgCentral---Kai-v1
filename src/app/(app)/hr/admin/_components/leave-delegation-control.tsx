'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    delegateFor?: string | null;
}

export function LeaveDelegationControl({ delegateFor }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(() => delegateFor ?? '');
    const router = useRouter();
    const searchParams = useSearchParams();
    const derivedDelegate = delegateFor ?? searchParams.get('delegateFor') ?? '';

    function applyDelegation() {
        const next = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            next.set('delegateFor', value.trim());
        } else {
            next.delete('delegateFor');
        }
        router.replace(`?${next.toString()}`);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" size="sm" variant="secondary">
                    {derivedDelegate ? `Acting: ${derivedDelegate}` : 'Delegate / Act on behalf'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delegate / Act on behalf</DialogTitle>
                    <DialogDescription>Specify an employee ID to act on behalf of for approvals.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="delegateFor">Employee ID</Label>
                    <Input
                        id="delegateFor"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder="employee-id"
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={applyDelegation}>Apply</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
