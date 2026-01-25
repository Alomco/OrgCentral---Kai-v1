'use client';

import { useActionState, useMemo } from 'react';

import type { InviteMemberActionState } from '../actions';
import { inviteMemberAction } from '../actions';

const initialState: InviteMemberActionState = { status: 'idle' };

export function InviteMemberForm(props: { roles: string[] }) {
    const [state, action, pending] = useActionState(inviteMemberAction, initialState);

    const roleOptions = useMemo(() => (props.roles.length > 0 ? props.roles : ['member']), [props.roles]);
    const defaultRole = useMemo(() => roleOptions[0] ?? 'member', [roleOptions]);

    const invitationUrl =
        state.status === 'success'
            ? `/accept-invitation?token=${encodeURIComponent(state.token)}`
            : null;

    return (
        <div className="rounded-2xl bg-[oklch(var(--card)/0.6)] p-6 backdrop-blur">
            <h2 className="text-base font-semibold text-[oklch(var(--foreground))]">Invite a member</h2>
            <p className="mt-1 text-sm text-[oklch(var(--muted-foreground))]">Create an invitation that grants access on acceptance.</p>

            <form action={action} className="mt-4 grid gap-3">
                <label className="grid gap-1">
                    <span className="text-[11px] font-medium text-[oklch(var(--muted-foreground))]">Email</span>
                    <input
                        name="email"
                        type="email"
                        required
                        className="h-9 w-full rounded-md border border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 text-sm text-[oklch(var(--foreground))]"
                        placeholder="user@example.com"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-[11px] font-medium text-[oklch(var(--muted-foreground))]">Role</span>
                    <select
                        name="role"
                        defaultValue={defaultRole}
                        className="h-9 w-full rounded-md border border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 text-sm text-[oklch(var(--foreground))]"
                    >
                        {roleOptions.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </label>

                {state.status !== 'idle' ? (
                    <p className="text-xs text-[oklch(var(--muted-foreground))]">{state.message}</p>
                ) : null}

                {state.status === 'success' ? (
                    <div className="grid gap-2 rounded-xl bg-[oklch(var(--muted)/0.35)] p-3">
                        <div className="text-xs text-[oklch(var(--muted-foreground))]">Invitation token</div>
                        <div className="break-all text-sm font-medium text-[oklch(var(--foreground))]">{state.token}</div>
                        {invitationUrl ? (
                            <a
                                href={invitationUrl}
                                className="text-xs text-[oklch(var(--primary))]"
                            >
                                Open accept-invitation link
                            </a>
                        ) : null}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={pending}
                    className="h-9 w-fit rounded-md bg-[oklch(var(--primary))] px-3 text-sm font-medium text-[oklch(var(--primary-foreground))] disabled:opacity-70"
                >
                    Create invitation
                </button>
            </form>
        </div>
    );
}
