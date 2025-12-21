'use client';

import { useActionState, useEffect } from 'react';
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

    const [rolesState, rolesAction, rolesPending] = useActionState(updateMemberRolesAction, initialState);
    const [suspendState, suspendAction, suspendPending] = useActionState(suspendMemberAction, initialState);
    const [resumeState, resumeAction, resumePending] = useActionState(resumeMemberAction, initialState);

    useEffect(() => {
        if (rolesState.status === 'success' || suspendState.status === 'success' || resumeState.status === 'success') {
            router.refresh();
        }
    }, [rolesState.status, suspendState.status, resumeState.status, router]);

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
            <div className="text-[11px] text-[hsl(var(--muted-foreground))]">Status: {props.status}</div>

            <form action={rolesAction} className="flex flex-col gap-2">
                <input type="hidden" name="targetUserId" value={props.userId} />
                <label className="grid gap-1">
                    <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">Role</span>
                    <input
                        name="roles"
                        defaultValue={props.initialRoles}
                        className="h-9 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))]"
                    />
                </label>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Only one role is currently supported.</span>
                {message ? <p className="text-xs text-[hsl(var(--muted-foreground))]">{message.message}</p> : null}
                <button
                    type="submit"
                    disabled={rolesPending}
                    className="h-9 w-fit rounded-md bg-[hsl(var(--primary))] px-3 text-sm font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-70"
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
                        className="h-9 w-fit rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm font-medium text-[hsl(var(--foreground))] disabled:opacity-70"
                    >
                        Suspend
                    </button>
                </form>
                <form action={resumeAction}>
                    <input type="hidden" name="targetUserId" value={props.userId} />
                    <button
                        type="submit"
                        disabled={!canResume || resumePending}
                        className="h-9 w-fit rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm font-medium text-[hsl(var(--foreground))] disabled:opacity-70"
                    >
                        Resume
                    </button>
                </form>
            </div>
        </div>
    );
}
