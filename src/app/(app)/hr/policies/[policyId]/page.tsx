import Link from 'next/link';
import { headers as nextHeaders } from 'next/headers';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getHrPolicyController } from '@/server/api-adapters/hr/policies/get-hr-policy';
import { getPolicyAcknowledgmentController } from '@/server/api-adapters/hr/policies/get-policy-acknowledgment';
import type { PolicyAcknowledgment } from '@/server/types/hr-ops-types';

import { formatHumanDate, formatHumanDateTime } from '../../_components/format-date';
import { acknowledgePolicyAction } from '../actions';

function getAcknowledgmentDisplay(policyVersion: string, acknowledgment: PolicyAcknowledgment | null): {
    isAcknowledged: boolean;
    description: string;
} {
    if (!acknowledgment) {
        return { isAcknowledged: false, description: 'Not acknowledged yet.' };
    }

    if (acknowledgment.version === policyVersion) {
        return {
            isAcknowledged: true,
            description: `Acknowledged ${formatHumanDateTime(acknowledgment.acknowledgedAt)}.`,
        };
    }

    return {
        isAcknowledged: false,
        description: `Acknowledged version ${acknowledgment.version} on ${formatHumanDateTime(acknowledgment.acknowledgedAt)}.`,
    };
}

export default async function HrPolicyPage({ params }: { params: { policyId: string } }) {
    const headerStore = await nextHeaders();

    const [{ policy }, { acknowledgment }] = await Promise.all([
        getHrPolicyController({
            headers: headerStore,
            input: { policyId: params.policyId },
            auditSource: 'ui:hr:policies:get',
        }),
        getPolicyAcknowledgmentController({
            headers: headerStore,
            input: { policyId: params.policyId },
            auditSource: 'ui:hr:policies:acknowledgment:get',
        }),
    ]);

    if (!policy) {
        notFound();
    }

    const acknowledgmentDisplay = getAcknowledgmentDisplay(policy.version, acknowledgment);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{policy.category}</Badge>
                        <Badge variant="outline">v{policy.version}</Badge>
                        <Badge variant="outline">{policy.status}</Badge>
                    </div>
                    <h1 className="text-2xl font-semibold">{policy.title}</h1>
                    <div className="text-sm text-muted-foreground">
                        Effective {formatHumanDate(policy.effectiveDate)}
                        {policy.expiryDate ? ` · Expires ${formatHumanDate(policy.expiryDate)}` : ''}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link className="text-sm font-semibold underline underline-offset-4" href="/hr/policies">
                        Back to policies
                    </Link>
                    <Link
                        className="text-sm font-semibold underline underline-offset-4"
                        href={`/hr/policies/${policy.id}/acknowledgments`}
                    >
                        Admin acknowledgments
                    </Link>
                </div>
            </div>

            {policy.requiresAcknowledgment ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Acknowledgment</CardTitle>
                        <CardDescription>{acknowledgmentDisplay.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {acknowledgmentDisplay.isAcknowledged ? (
                            <Badge variant="secondary">Acknowledged</Badge>
                        ) : (
                            <form action={acknowledgePolicyAction} className="flex flex-wrap items-center gap-3">
                                <input type="hidden" name="policyId" value={policy.id} />
                                <input type="hidden" name="version" value={policy.version} />
                                <Button type="submit">Acknowledge policy</Button>
                                <div className="text-sm text-muted-foreground">
                                    Confirms you have read and understood this policy.
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Acknowledgment</CardTitle>
                        <CardDescription>This policy does not require acknowledgment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline">Optional</Badge>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Policy text</CardTitle>
                    <CardDescription>Stored as plain text (rendered safely).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-6">{policy.content}</div>
                </CardContent>
            </Card>
        </div>
    );
}

