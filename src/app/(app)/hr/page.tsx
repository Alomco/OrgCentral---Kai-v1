import { headers as nextHeaders } from 'next/headers';
import { redirect } from 'next/navigation';

import { hasPermission } from '@/lib/security/permission-check';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { getHrSessionContextOrRedirect } from '@/server/ui/auth/hr-session';

export default async function HrLandingPage() {
    const headerStore = await nextHeaders();
    const { authorization } = await getHrSessionContextOrRedirect({}, {
        headers: headerStore,
        requiredPermissions: HR_PERMISSION_PROFILE.ORG_SETTINGS_READ,
        auditSource: 'ui:hr:landing',
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE_TYPE.ORG_SETTINGS,
    });

    if (hasPermission(authorization.permissions, 'employeeProfile', 'read')) {
        redirect('/hr/dashboard');
    }

    if (
        hasPermission(authorization.permissions, 'audit', 'read') ||
        hasPermission(authorization.permissions, 'residency', 'enforce')
    ) {
        redirect('/hr/compliance');
    }

    redirect('/access-denied');
}

