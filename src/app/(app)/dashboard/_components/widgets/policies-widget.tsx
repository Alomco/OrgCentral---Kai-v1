import { FileText } from 'lucide-react';

import { DashboardWidgetCard } from '../dashboard-widget-card';
import type { DashboardViewerContext } from '../dashboard-viewer-context';
import { requireSessionAuthorization } from '@/server/security/authorization';
import { defaultHrPolicyServiceProvider } from '@/server/services/hr/policies/hr-policy-service.provider';
import { HR_POLICY_RESOURCE_POLICY } from '@/server/api-adapters/hr/policies/common';
import type { HRPolicy } from '@/server/types/hr-ops-types';

function sortPoliciesByEffectiveDateDescending(policies: HRPolicy[]): HRPolicy[] {
    return policies.slice().sort((left, right) => right.effectiveDate.getTime() - left.effectiveDate.getTime());
}

export async function PoliciesWidget(props: DashboardViewerContext) {
    const authorization = await requireSessionAuthorization(props.session, {
        orgId: props.baseAuthorization.orgId,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'ui:dashboard:policies',
        correlationId: props.baseAuthorization.correlationId,
        action: 'read',
        resourceType: HR_POLICY_RESOURCE_POLICY,
        resourceAttributes: { view: 'dashboard' },
    }).catch(() => null);

    if (!authorization) {
        return (
            <DashboardWidgetCard
                title="HR policies"
                description="Review and acknowledge required policies."
                icon={FileText}
                href="/hr/policies"
                ctaLabel="Open policies"
                state="locked"
                statusLabel="Restricted"
                footerHint="You do not have access to policy data."
            />
        );
    }

    const policies = await defaultHrPolicyServiceProvider.service
        .listPolicies({ authorization })
        .catch(() => null);

    if (!policies) {
        return (
            <DashboardWidgetCard
                title="HR policies"
                description="Review and acknowledge required policies."
                icon={FileText}
                href="/hr/policies"
                ctaLabel="Open policies"
                state="error"
                footerHint="Unable to load policies right now."
            />
        );
    }

    const total = policies.length;

    if (total === 0) {
        return (
            <DashboardWidgetCard
                title="HR policies"
                description="Review and acknowledge required policies."
                icon={FileText}
                value="0"
                href="/hr/policies"
                ctaLabel="Open policies"
                footerHint="No policies are available yet."
            />
        );
    }

    const requiredAcknowledgmentCount = policies.filter((policy) => policy.requiresAcknowledgment).length;
    const latestTitle = sortPoliciesByEffectiveDateDescending(policies)[0].title;
    const hint = `${String(requiredAcknowledgmentCount)} require acknowledgment. Latest: ${latestTitle}.`;

    return (
        <DashboardWidgetCard
            title="HR policies"
            description="Review and acknowledge required policies."
            icon={FileText}
            value={String(total)}
            href="/hr/policies"
            ctaLabel="Open policies"
            footerHint={hint}
        />
    );
}
