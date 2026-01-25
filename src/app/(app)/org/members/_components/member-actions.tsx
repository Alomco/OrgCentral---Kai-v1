'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import type { MemberActionState } from '../actions';
import { resumeMemberAction, suspendMemberAction, updateMemberRolesAction } from '../actions';

const initialState: MemberActionState = { status: 'idle' };

type MembershipStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export function MemberActions(props: {
    userId: string;
    initialRoles: string;
    status: MembershipStatus;
}) {
    const router = useRouter();
    const lastRefreshReference = useRef<string | null>(null);

    const [rolesState, rolesAction, rolesPending] = useActionState(updateMemberRolesAction, initialState);
    const [suspendState, suspendAction, suspendPending] = useActionState(suspendMemberAction, initialState);
    const [resumeState, resumeAction, resumePending] = useActionState(resumeMemberAction, initialState);

    const rolesRequestId = rolesState.status === 'success' ? rolesState.requestId : null;
    const suspendRequestId = suspendState.status === 'success' ? suspendState.requestId : null;
    const resumeRequestId = resumeState.status === 'success' ? resumeState.requestId : null;
    const activeRequestId = rolesRequestId ?? suspendRequestId ?? resumeRequestId;

    useEffect(() => {
        if (!activeRequestId) {
            return;
        }
        if (lastRefreshReference.current === activeRequestId) {
            return;
        }
        lastRefreshReference.current = activeRequestId;
        router.refresh();
    }, [activeRequestId, router]);

    const message =
        rolesState.status !== 'idle'
            ? rolesState
            : suspendState.status !== 'idle'
                ? suspendState
                : resumeState.status !== 'idle'
                    ? resumeState
                    : null;

    const canSuspend = props.status === 'ACTIVE';
    const canResume = props.status === 'SUSPENDED';

    return (
        <div className="mt-2 grid gap-2">
            <div className="text-[11px] text-[oklch(var(--muted-foreground))]">Status: {props.status}</div>

            <form action={rolesAction} className="flex flex-col gap-2">
                <input type="hidden" name="targetUserId" value={props.userId} />
                <label className="grid gap-1">
                    <span className="text-[11px] font-medium text-[oklch(var(--muted-foreground))]">Role</span>
                    <input
                        name="roles"
                        defaultValue={props.initialRoles}
                        className="h-9 w-full rounded-md border border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 text-sm text-[oklch(var(--foreground))]"
                    />
                </label>
                <span className="text-[11px] text-[oklch(var(--muted-foreground))]">Only one role is currently supported.</span>
                {message ? <p className="text-xs text-[oklch(var(--muted-foreground))]">{message.message}</p> : null}
                <button
                    type="submit"
                    disabled={rolesPending}
                    className="h-9 w-fit rounded-md bg-[oklch(var(--primary))] px-3 text-sm font-medium text-[oklch(var(--primary-foreground))] disabled:opacity-70"
                >
                    Update roles
                </button>
            </form>

            <div className="flex flex-wrap gap-2">
                <form action={suspendAction}>
                    <input type="hidden" name="targetUserId" value={props.userId} />
                    <button
                        type="submit"
                        disabled={!canSuspend || suspendPending}
                        className="h-9 w-fit rounded-md border border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 text-sm font-medium text-[oklch(var(--foreground))] disabled:opacity-70"
                    >
                        Suspend
                    </button>
                </form>
                <form action={resumeAction}>
                    <input type="hidden" name="targetUserId" value={props.userId} />
                    <button
                        type="submit"
                        disabled={!canResume || resumePending}
                        className="h-9 w-fit rounded-md border border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 text-sm font-medium text-[oklch(var(--foreground))] disabled:opacity-70"
                    >
                        Resume
                    </button>
                </form>
            </div>
        </div>
    );
}
