import { Users } from 'lucide-react';

import { DashboardWidgetCard } from '../dashboard-widget-card';
import type { DashboardViewerContext } from '../dashboard-viewer-context';
import { requireSessionAuthorization } from '@/server/security/authorization';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';

export async function EmployeesWidget(props: DashboardViewerContext) {
    const authorization = await requireSessionAuthorization(props.session, {
        orgId: props.baseAuthorization.orgId,
        requiredPermissions: { employeeProfile: ['list'] },
        auditSource: 'ui:dashboard:employees',
        correlationId: props.baseAuthorization.correlationId,
        action: 'read',
        resourceType: 'employeeProfile',
        resourceAttributes: { view: 'dashboard', employmentStatus: 'ACTIVE', metric: 'count' },
    }).catch(() => null);

    if (!authorization) {
        return (
            <DashboardWidgetCard
                title="Employees"
                description="Employee directory and profiles."
                icon={Users}
                href="/hr/employees"
                ctaLabel="Manage employees"
                state="locked"
                statusLabel="Admin only"
                footerHint="Only administrators can view employee metrics."
            />
        );
    }

    const peopleService = getPeopleService();
    const count = await peopleService
        .countEmployeeProfiles({
            authorization,
            payload: { filters: { employmentStatus: 'ACTIVE' } },
        })
        .then((result) => result.count)
        .catch(() => null);

    if (count === null) {
        return (
            <DashboardWidgetCard
                title="Employees"
                description="Employee directory and profiles."
                icon={Users}
                href="/hr/employees"
                ctaLabel="Manage employees"
                state="error"
                footerHint="Unable to load employee metrics right now."
            />
        );
    }

    return (
        <DashboardWidgetCard
            title="Employees"
            description="Employee directory and profiles."
            icon={Users}
            value={String(count)}
            href="/hr/employees"
            ctaLabel="Manage employees"
            footerHint="Active employee profiles."
        />
    );
}
