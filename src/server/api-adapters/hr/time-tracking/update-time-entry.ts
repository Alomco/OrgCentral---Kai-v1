import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { UpdateTimeEntryResult } from '@/server/use-cases/hr/time-tracking/update-time-entry';
import {
    updateTimeEntrySchema,
    type UpdateTimeEntryPayload,
} from '@/server/types/hr-time-tracking-schemas';
import {
    defaultTimeTrackingControllerDependencies,
    resolveTimeTrackingControllerDependencies,
    TIME_ENTRY_RESOURCE,
    type TimeTrackingControllerDependencies,
} from './common';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

export interface UpdateTimeEntryControllerInput {
    headers: Headers | HeadersInit;
    entryId: string;
    input: unknown;
    auditSource: string;
}

export async function updateTimeEntryController(
    controllerInput: UpdateTimeEntryControllerInput,
    dependencies: TimeTrackingControllerDependencies = defaultTimeTrackingControllerDependencies,
): Promise<UpdateTimeEntryResult> {
    const resolved = resolveTimeTrackingControllerDependencies(dependencies);
    const entryId = z.uuid().parse(controllerInput.entryId);
    const payload = updateTimeEntrySchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: HR_ACTION.UPDATE,
        resourceType: TIME_ENTRY_RESOURCE,
        resourceAttributes: buildResourceAttributes(entryId, payload),
    });

    return resolved.service.updateTimeEntry({ authorization, entryId, payload });
}

function buildResourceAttributes(
    entryId: string,
    payload: UpdateTimeEntryPayload,
): Record<string, unknown> {
    return {
        entryId,
        status: payload.status ?? null,
        hasClockOut: payload.clockOut !== undefined,
    };
}
