import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { CreateTimeEntryResult } from '@/server/use-cases/hr/time-tracking/create-time-entry';
import {
    createTimeEntrySchema,
    type CreateTimeEntryPayload,
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

export interface CreateTimeEntryControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export async function createTimeEntryController(
    controllerInput: CreateTimeEntryControllerInput,
    dependencies: TimeTrackingControllerDependencies = defaultTimeTrackingControllerDependencies,
): Promise<CreateTimeEntryResult> {
    const resolved = resolveTimeTrackingControllerDependencies(dependencies);
    const payload = createTimeEntrySchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE,
        auditSource: controllerInput.auditSource,
        action: HR_ACTION.CREATE,
        resourceType: TIME_ENTRY_RESOURCE,
        resourceAttributes: buildResourceAttributes(payload),
    });

    await enforceTimeTrackingMutationRateLimit({
        authorization,
        headers: controllerInput.headers,
        action: 'create',
    });

    return resolved.service.createTimeEntry({ authorization, payload });
}

function buildResourceAttributes(payload: CreateTimeEntryPayload): Record<string, unknown> {
    return {
        targetUserId: payload.userId,
        status: payload.status ?? null,
        hasClockOut: payload.clockOut !== null && payload.clockOut !== undefined,
    };
}
