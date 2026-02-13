import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { UpdateTimeEntryResult } from '@/server/use-cases/hr/time-tracking/update-time-entry';
import {
    updateTimeEntrySchema,
    type UpdateTimeEntryPayload,
} from '@/server/types/hr-time-tracking-schemas';
import {
    enforceTimeTrackingMutationRateLimit,
} from '@/server/lib/security/time-tracking-rate-limit';
import {
    defaultTimeTrackingControllerDependencies,
    resolveTimeTrackingControllerDependencies,
    TIME_ENTRY_RESOURCE,
    type TimeTrackingControllerDependencies,
} from './common';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';
import { HR_PERMISSION_PROFILE } from '@/server/security/authorization/hr-permissions/profiles';

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
        requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE,
        auditSource: controllerInput.auditSource,
        action: HR_ACTION.UPDATE,
        resourceType: TIME_ENTRY_RESOURCE,
        resourceAttributes: buildResourceAttributes(entryId, payload),
    });

    await enforceTimeTrackingMutationRateLimit({
        authorization,
        headers: controllerInput.headers,
        action: 'update',
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
