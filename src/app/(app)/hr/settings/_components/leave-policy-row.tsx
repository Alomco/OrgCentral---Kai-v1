'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LeavePolicy } from '@/server/types/leave-types';

import { LeavePolicyDeleteForm } from './leave-policy-delete-form';
import { LeavePolicyUpdateForm } from './leave-policy-update-form';

export function LeavePolicyRow(props: {
    policy: LeavePolicy;
    policyTypes: readonly string[];
    isHighlighted?: boolean;
}) {
    return (
        <div
            id={`leave-policy-${props.policy.id}`}
            className={cn(
                'space-y-3 rounded-lg border p-3 transition-shadow',
                props.isHighlighted
                    ? 'border-primary/40 bg-primary/5 shadow-[0_0_0_1px_oklch(var(--primary)/0.25)]'
                    : 'bg-background',
            )}
            data-highlighted={props.isHighlighted ? 'true' : 'false'}
        >
            {props.isHighlighted ? (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Recently created</span>
                    <Badge variant="secondary">New</Badge>
                </div>
            ) : null}
            <LeavePolicyUpdateForm policy={props.policy} policyTypes={props.policyTypes} />
            <LeavePolicyDeleteForm policyId={props.policy.id} />
        </div>
    );
}
