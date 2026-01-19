import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '../../_components/employee-formatters';
import { formatChecklistProgressLabel, formatChecklistStatus } from './employee-offboarding-card.helpers';
import type { ChecklistProgressInfo } from './employee-offboarding-card.types';

interface OffboardingSummarySectionProps {
    profileId: string;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
    checklistProgress: ChecklistProgressInfo | null;
}

export function OffboardingSummarySection({
    profileId,
    startedAt,
    completedAt,
    checklistProgress,
}: OffboardingSummarySectionProps) {
    const progressLabel = checklistProgress
        ? formatChecklistProgressLabel(checklistProgress.completed, checklistProgress.total)
        : null;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Started: {formatDate(startedAt)}</span>
                <span>Completed: {formatDate(completedAt)}</span>
            </div>
            {checklistProgress ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Checklist progress</span>
                        <span>{progressLabel}</span>
                    </div>
                    <Progress value={checklistProgress.percent} />
                    <p className="text-xs text-muted-foreground">
                        Status: {formatChecklistStatus(checklistProgress.status)}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    No checklist assigned to this offboarding.
                </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
                <Button asChild size="sm" variant="outline">
                    <Link href={`/hr/employees/${profileId}?tab=checklists`}>View checklists</Link>
                </Button>
            </div>
        </div>
    );
}
