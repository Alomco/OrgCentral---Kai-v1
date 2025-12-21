import Link from 'next/link';
import { headers as nextHeaders } from 'next/headers';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listHrPoliciesController } from '@/server/api-adapters/hr/policies/list-hr-policies';
import { formatHumanDate } from '../_components/format-date';

export default async function HrDashboardPage() {
    const headerStore = await nextHeaders();

    let policySummary:
        | { kind: 'ready'; total: number; recent: { id: string; title: string; effectiveDate: Date }[] }
        | { kind: 'error'; message: string } = { kind: 'ready', total: 0, recent: [] };

    try {
        const { policies } = await listHrPoliciesController({
            headers: headerStore,
            input: {},
            auditSource: 'ui:hr:dashboard:policies',
        });

        const sorted = policies
            .slice()
            .sort((left, right) => right.effectiveDate.getTime() - left.effectiveDate.getTime());

        policySummary = {
            kind: 'ready',
            total: policies.length,
            recent: sorted.slice(0, 5).map((policy) => ({
                id: policy.id,
                title: policy.title,
                effectiveDate: policy.effectiveDate,
            })),
        };
    } catch (error: unknown) {
        policySummary = {
            kind: 'error',
            message: error instanceof Error ? error.message : 'Unable to load HR dashboard data.',
        };
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">HR Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Early HR migration surface (policies first).
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Policies</CardTitle>
                    <CardDescription>Read and acknowledge HR policies for this organization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {policySummary.kind === 'error' ? (
                        <div className="text-sm text-destructive">{policySummary.message}</div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{policySummary.total} total</Badge>
                                <Link
                                    className="text-sm font-semibold underline underline-offset-4"
                                    href="/hr/policies"
                                >
                                    View all policies
                                </Link>
                            </div>
                            {policySummary.recent.length > 0 ? (
                                <div className="space-y-2">
                                    {policySummary.recent.map((policy) => (
                                        <Link
                                            key={policy.id}
                                            href={`/hr/policies/${policy.id}`}
                                            className="block rounded-lg border px-4 py-3 transition-colors hover:bg-muted"
                                        >
                                            <div className="text-sm font-medium">{policy.title}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Effective {formatHumanDate(policy.effectiveDate)}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">No policies have been published yet.</div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Next migrations</CardTitle>
                    <CardDescription>Leave, absences, compliance, onboarding, and employee records.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    HR pages from the legacy app will be rebuilt here using Next.js server components and the new
                    `/api/hr/*` routes.
                </CardContent>
            </Card>
        </div>
    );
}
