'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SUPPORT_TICKET_STATUSES, type SupportTicketStatus } from '@/server/types/platform/support-tickets';

import { updateSupportTicketAction, type SupportTicketActionState } from '../actions';

const initialState: SupportTicketActionState = { status: 'idle' };

export function SupportTicketUpdateForm({
    ticketId,
    status,
    version,
}: {
    ticketId: string;
    status: SupportTicketStatus;
    version: number;
}) {
    const [state, formAction, pending] = useActionState(updateSupportTicketAction, initialState);

    return (
        <form action={formAction} className="flex flex-col gap-2">
            <input type="hidden" name="ticketId" value={ticketId} />
            <input type="hidden" name="expectedVersion" value={String(version)} />
            <select
                name="status"
                defaultValue={status}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                disabled={pending}
            >
                {SUPPORT_TICKET_STATUSES.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <Input name="assignedTo" placeholder="Assignee user ID" className="h-8" disabled={pending} />
            <Button size="sm" type="submit" disabled={pending}>Update</Button>
            {state.status !== 'idle' ? (
                <Alert>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            ) : null}
        </form>
    );
}
