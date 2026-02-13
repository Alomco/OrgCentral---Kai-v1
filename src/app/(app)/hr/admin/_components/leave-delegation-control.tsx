'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { EmployeeLookupField } from '@/app/(app)/hr/_components/employee-lookup-field';
import type { EmployeeLookupOption } from '@/app/(app)/hr/_components/employee-lookup.types';

interface Props {
    delegateFor?: string | null;
    employeeOptions: EmployeeLookupOption[];
}

function formatDelegateLabel(
    delegateFor: string,
    employeeMap: Map<string, EmployeeLookupOption>,
): string {
    const selected = employeeMap.get(delegateFor);
    if (!selected) {
        return delegateFor;
    }
    return selected.employeeNumber
        ? `${selected.displayName} (${selected.employeeNumber})`
        : selected.displayName;
}

export function LeaveDelegationControl({ delegateFor, employeeOptions }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(() => delegateFor ?? '');
    const router = useRouter();
    const searchParams = useSearchParams();
    const derivedDelegate = delegateFor ?? searchParams.get('delegateFor') ?? '';
    const employeeMap = useMemo(() => {
        const map = new Map<string, EmployeeLookupOption>();
        for (const option of employeeOptions) {
            map.set(option.id, option);
        }
        return map;
    }, [employeeOptions]);

    useEffect(() => {
        setValue(derivedDelegate);
    }, [derivedDelegate]);

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
                    {derivedDelegate
                        ? `Acting for: ${formatDelegateLabel(derivedDelegate, employeeMap)}`
                        : 'Act on behalf'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Act on behalf</DialogTitle>
                    <DialogDescription>
                        Choose the employee you are covering for. Clear selection to stop delegation.
                    </DialogDescription>
                </DialogHeader>
                <EmployeeLookupField
                    id="delegateFor"
                    label="Employee"
                    value={value}
                    onChange={setValue}
                    options={employeeOptions}
                    placeholder="Select employee"
                    searchPlaceholder="Search by name, employee number, or email"
                    emptyText="No employee found."
                    helperText="Selection is scoped to your organization and saved in the URL."
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        type="button"
                        onClick={applyDelegation}
                        disabled={Boolean(value) && !employeeMap.has(value)}
                    >
                        Apply
                    </Button>
                </DialogFooter>
                {!employeeOptions.length ? (
                    <p className="text-xs text-muted-foreground">
                        No employee records are currently available for delegation.
                    </p>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
