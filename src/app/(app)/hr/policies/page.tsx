import Link from 'next/link';
import { headers as nextHeaders } from 'next/headers';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listHrPoliciesController } from '@/server/api-adapters/hr/policies/list-hr-policies';
import type { HRPolicy } from '@/server/types/hr-ops-types';

import { formatHumanDate } from '../_components/format-date';

function sortPoliciesByEffectiveDateDescending(policies: HRPolicy[]): HRPolicy[] {
    return policies.slice().sort((left, right) => right.effectiveDate.getTime() - left.effectiveDate.getTime());
}

export default async function HrPoliciesPage() {
    const headerStore = await nextHeaders();
    const result = await listHrPoliciesController({
        headers: headerStore,
        input: {},
        auditSource: 'ui:hr:policies:list',
    });

    const policies = sortPoliciesByEffectiveDateDescending(result.policies);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Policies</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review and acknowledge organization policies.
                    </p>
                </div>
                <Badge variant="secondary">{policies.length} total</Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All policies</CardTitle>
                    <CardDescription>Latest effective policies appear first.</CardDescription>
                </CardHeader>
                <CardContent>
                    {policies.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No policies are available yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b text-left">
                                    <tr>
                                        <th className="px-2 py-2 font-medium">Title</th>
                                        <th className="px-2 py-2 font-medium">Category</th>
                                        <th className="px-2 py-2 font-medium">Version</th>
                                        <th className="px-2 py-2 font-medium">Effective</th>
                                        <th className="px-2 py-2 font-medium">Status</th>
                                        <th className="px-2 py-2 font-medium">Ack</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {policies.map((policy) => (
                                        <tr key={policy.id} className="border-b last:border-b-0 hover:bg-muted/50">
                                            <td className="px-2 py-2">
                                                <Link
                                                    href={`/hr/policies/${policy.id}`}
                                                    className="font-medium underline underline-offset-4"
                                                >
                                                    {policy.title}
                                                </Link>
                                            </td>
                                            <td className="px-2 py-2 text-muted-foreground">{policy.category}</td>
                                            <td className="px-2 py-2 text-muted-foreground">{policy.version}</td>
                                            <td className="px-2 py-2 text-muted-foreground">
                                                {formatHumanDate(policy.effectiveDate)}
                                            </td>
                                            <td className="px-2 py-2">
                                                <Badge variant="outline">{policy.status}</Badge>
                                            </td>
                                            <td className="px-2 py-2">
                                                <Badge variant={policy.requiresAcknowledgment ? 'secondary' : 'outline'}>
                                                    {policy.requiresAcknowledgment ? 'Required' : 'Optional'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

