import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listPolicyAcknowledgmentsController } from '@/server/api-adapters/hr/policies/list-policy-acknowledgments';

import { formatHumanDateTime } from '../../../_components/format-date';

export default async function HrPolicyAcknowledgmentsPage({ params }: { params: { policyId: string } }) {
    const headerStore = await nextHeaders();

    let acknowledgmentResponse:
        | { kind: 'ready'; acknowledgments: Awaited<ReturnType<typeof listPolicyAcknowledgmentsController>>['acknowledgments'] }
        | { kind: 'error'; message: string } = { kind: 'ready', acknowledgments: [] };

    try {
        const { acknowledgments } = await listPolicyAcknowledgmentsController({
            headers: headerStore,
            input: { policyId: params.policyId },
            auditSource: 'ui:hr:policies:acknowledgments:list',
        });
        acknowledgmentResponse = { kind: 'ready', acknowledgments };
    } catch (error: unknown) {
        acknowledgmentResponse = {
            kind: 'error',
            message: error instanceof Error ? error.message : 'Unable to load acknowledgments.',
        };
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Policy acknowledgments</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Admin view of who has acknowledged this policy.
                    </p>
                </div>
                <Link className="text-sm font-semibold underline underline-offset-4" href={`/hr/policies/${params.policyId}`}>
                    Back to policy
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Acknowledgments</CardTitle>
                    <CardDescription>Requires `orgAdmin` role.</CardDescription>
                </CardHeader>
                <CardContent>
                    {acknowledgmentResponse.kind === 'error' ? (
                        <div className="text-sm text-destructive">{acknowledgmentResponse.message}</div>
                    ) : acknowledgmentResponse.acknowledgments.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No acknowledgments recorded yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b text-left">
                                    <tr>
                                        <th className="px-2 py-2 font-medium">User</th>
                                        <th className="px-2 py-2 font-medium">Version</th>
                                        <th className="px-2 py-2 font-medium">Acknowledged</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {acknowledgmentResponse.acknowledgments.map((acknowledgment) => (
                                        <tr
                                            key={acknowledgment.id}
                                            className="border-b last:border-b-0 hover:bg-muted/50"
                                        >
                                            <td className="px-2 py-2">
                                                <Badge variant="outline">{acknowledgment.userId}</Badge>
                                            </td>
                                            <td className="px-2 py-2 text-muted-foreground">{acknowledgment.version}</td>
                                            <td className="px-2 py-2 text-muted-foreground">
                                                {formatHumanDateTime(acknowledgment.acknowledgedAt)}
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

