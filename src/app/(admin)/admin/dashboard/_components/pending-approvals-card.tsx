import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';

import { ThemeButton } from '@/components/theme/primitives/interactive';
import {
    ThemeCard,
    ThemeCardContent,
    ThemeCardDescription,
    ThemeCardHeader,
    ThemeCardTitle,
} from '@/components/theme/cards/theme-card';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { getAdminDashboardPendingApprovals } from '@/server/use-cases/admin/dashboard/get-admin-dashboard-pending-approvals';

interface PendingApprovalsCardProps {
    authorization: RepositoryAuthorizationContext;
}

function formatDueDate(date: Date | null): string {
    if (!date) {
        return 'No due date';
    }
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
    }).format(date);
}

export async function PendingApprovalsCard({ authorization }: PendingApprovalsCardProps) {
    const approvals = await getAdminDashboardPendingApprovals(authorization);

    return (
        <ThemeCard variant="glass" hover="lift" padding="lg" className="h-full">
            <ThemeCardHeader accent>
                <ThemeCardTitle size="md">Pending approvals</ThemeCardTitle>
                <ThemeCardDescription>
                    Items awaiting governance approval or compliance review.
                </ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
                {approvals.length === 0 ? (
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
                        No pending approvals. Review queue is clear.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {approvals.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-card/40 p-4"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Due {formatDueDate(item.dueDate ?? null)}
                                    </p>
                                </div>
                                <Link href={item.href}>
                                    <ThemeButton variant="outline" size="sm">
                                        Review
                                    </ThemeButton>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </ThemeCardContent>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Compliance reviews require delegated approval.
                </div>
                <Link href="/hr/compliance">
                    <ThemeButton variant="ghost" size="sm">
                        Open compliance
                    </ThemeButton>
                </Link>
            </div>
        </ThemeCard>
    );
}

export function PendingApprovalsSkeleton() {
    return (
        <ThemeCard variant="glass" padding="lg" className="h-full">
            <div className="h-5 w-40 rounded bg-muted/40 animate-pulse" />
            <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={String(index)} className="h-14 rounded-lg bg-muted/20 animate-pulse" />
                ))}
            </div>
        </ThemeCard>
    );
}
