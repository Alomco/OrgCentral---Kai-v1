import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { GetTimeEntryResult } from '@/server/use-cases/hr/time-tracking/get-time-entry';
import {
    defaultTimeTrackingControllerDependencies,
    resolveTimeTrackingControllerDependencies,
    TIME_ENTRY_RESOURCE,
    type TimeTrackingControllerDependencies,
} from './common';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';
import { HR_PERMISSION_PROFILE } from '@/server/security/authorization/hr-permissions/profiles';

export interface GetTimeEntryControllerInput {
    headers: Headers | HeadersInit;
    entryId: string;
    auditSource: string;
}

export async function getTimeEntryController(
    controllerInput: GetTimeEntryControllerInput,
    dependencies: TimeTrackingControllerDependencies = defaultTimeTrackingControllerDependencies,
): Promise<GetTimeEntryResult> {
    const resolved = resolveTimeTrackingControllerDependencies(dependencies);

    const entryId = z.uuid().parse(controllerInput.entryId);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_READ,
        auditSource: controllerInput.auditSource,
        action: HR_ACTION.READ,
        resourceType: TIME_ENTRY_RESOURCE,
        resourceAttributes: { entryId },
    });

    return resolved.service.getTimeEntry({ authorization, entryId });
}
