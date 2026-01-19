import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OffboardingQueueStats } from './offboarding-queue-utils';

interface OffboardingQueueStatsProps {
    stats: OffboardingQueueStats;
}

export function OffboardingQueueStatsRow({ stats }: OffboardingQueueStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="In progress" value={stats.inProgress} />
            <StatCard
                label="Overdue"
                value={stats.overdue}
                description="Started more than 30 days ago"
            />
            <StatCard label="Completed (30 days)" value={stats.completedLast30} />
        </div>
    );
}

function StatCard({ label, value, description }: { label: string; value: number; description?: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold">{value}</div>
                {description ? (
                    <p className="text-xs text-muted-foreground">{description}</p>
                ) : null}
            </CardContent>
        </Card>
    );
}
