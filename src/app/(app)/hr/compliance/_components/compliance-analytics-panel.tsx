import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getComplianceAnalyticsForUi } from '@/server/use-cases/hr/compliance/get-compliance-analytics.cached';

interface ComplianceAnalyticsPanelProps {
    authorization: RepositoryAuthorizationContext;
}

function formatDelta(current: number, previous: number): string {
    if (previous === 0) {
        return current > 0 ? '↑ New activity' : 'No change';
    }
    const delta = ((current - previous) / previous) * 100;
    const prefix = delta >= 0 ? '↑' : '↓';
    return `${prefix} ${Math.abs(delta).toFixed(1)}% vs prior 30d`;
}

export async function ComplianceAnalyticsPanel({ authorization }: ComplianceAnalyticsPanelProps) {
    const analytics = await getComplianceAnalyticsForUi({ authorization }).catch(() => null);
    if (!analytics) {
        return null;
    }

    const { snapshot } = analytics;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Compliance analytics</CardTitle>
                <CardDescription>Organization-wide compliance status and trends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <KpiCard label="Total items" value={snapshot.total} />
                    <KpiCard label="Overdue" value={snapshot.overdue} tone="destructive" />
                    <KpiCard label="Expiring soon (30d)" value={snapshot.expiringSoon} tone="warning" />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Status breakdown</CardTitle>
                            <CardDescription>Pending, review, and completed items.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Badge variant="outline">Pending {snapshot.byStatus.PENDING}</Badge>
                            <Badge variant="outline">Pending review {snapshot.byStatus.PENDING_REVIEW}</Badge>
                            <Badge variant="outline">Missing {snapshot.byStatus.MISSING}</Badge>
                            <Badge variant="outline">Expired {snapshot.byStatus.EXPIRED}</Badge>
                            <Badge variant="secondary">Complete {snapshot.byStatus.COMPLETE}</Badge>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Completion trend</CardTitle>
                            <CardDescription>Completions in the last 30 days.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-2xl font-semibold">
                                {snapshot.completedLast30}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formatDelta(snapshot.completedLast30, snapshot.completedPrev30)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}

function KpiCard({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'destructive' }) {
    const toneClass = tone === 'destructive'
        ? 'text-destructive'
        : tone === 'warning'
            ? 'text-warning'
            : 'text-foreground';

    return (
        <Card className="border-border/60">
            <CardHeader className="space-y-1">
                <CardDescription>{label}</CardDescription>
                <CardTitle className={`text-2xl font-semibold ${toneClass}`}>{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}
