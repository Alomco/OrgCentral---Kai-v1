import { ShieldCheck } from 'lucide-react';

import { DashboardWidgetCard } from '../dashboard-widget-card';
import type { DashboardViewerContext } from '../dashboard-viewer-context';
import { requireSessionAuthorization } from '@/server/security/authorization';
import { getComplianceStatusService } from '@/server/services/hr/compliance/compliance-status.service.provider';

export async function ComplianceWidget(props: DashboardViewerContext) {
    const authorization = await requireSessionAuthorization(props.session, {
        orgId: props.baseAuthorization.orgId,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'ui:dashboard:compliance',
        correlationId: props.baseAuthorization.correlationId,
        action: 'read',
        resourceType: 'hr.compliance',
        resourceAttributes: { targetUserId: props.baseAuthorization.userId, view: 'dashboard' },
    }).catch(() => null);

    if (!authorization) {
        return (
            <DashboardWidgetCard
                title="Compliance"
                description="Your assigned compliance items and status."
                icon={ShieldCheck}
                href="/hr/compliance"
                ctaLabel="View compliance"
                state="locked"
                statusLabel="Restricted"
                footerHint="You do not have access to compliance data."
            />
        );
    }

    const complianceService = getComplianceStatusService();
    const statusResult = await complianceService
        .getStatusForUser(authorization, props.baseAuthorization.userId)
        .then((snapshot) => ({ kind: 'ready' as const, snapshot }))
        .catch(() => ({ kind: 'error' as const, snapshot: null }));

    if (statusResult.kind === 'error') {
        return (
            <DashboardWidgetCard
                title="Compliance"
                description="Your assigned compliance items and status."
                icon={ShieldCheck}
                href="/hr/compliance"
                ctaLabel="View compliance"
                state="error"
                footerHint="Unable to load compliance status right now."
            />
        );
    }

    const snapshot = statusResult.snapshot;

    if (!snapshot) {
        return (
            <DashboardWidgetCard
                title="Compliance"
                description="Your assigned compliance items and status."
                icon={ShieldCheck}
                value="0"
                href="/hr/compliance"
                ctaLabel="View compliance"
                footerHint="No compliance items assigned yet."
            />
        );
    }

    return (
        <DashboardWidgetCard
            title="Compliance"
            description="Your assigned compliance items and status."
            icon={ShieldCheck}
            value={String(snapshot.itemCount)}
            href="/hr/compliance"
            ctaLabel="View compliance"
            footerHint={`Status: ${snapshot.status}`}
        />
    );
}
