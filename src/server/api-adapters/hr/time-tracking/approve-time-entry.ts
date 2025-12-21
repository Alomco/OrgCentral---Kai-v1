import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { ApproveTimeEntryResult } from '@/server/use-cases/hr/time-tracking/approve-time-entry';
import {
    approveTimeEntrySchema,
    type ApproveTimeEntryPayload,
} from '@/server/types/hr-time-tracking-schemas';
import {
    defaultTimeTrackingControllerDependencies,
    resolveTimeTrackingControllerDependencies,
    TIME_ENTRY_RESOURCE,
    type TimeTrackingControllerDependencies,
} from './common';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

export interface ApproveTimeEntryControllerInput {
    headers: Headers | HeadersInit;
    entryId: string;
    input: unknown;
    auditSource: string;
}

export async function approveTimeEntryController(
    controllerInput: ApproveTimeEntryControllerInput,
    dependencies: TimeTrackingControllerDependencies = defaultTimeTrackingControllerDependencies,
): Promise<ApproveTimeEntryResult> {
    const resolved = resolveTimeTrackingControllerDependencies(dependencies);
    const entryId = z.uuid().parse(controllerInput.entryId);
    const payload = approveTimeEntrySchema.parse(controllerInput.input ?? {});

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: HR_ACTION.UPDATE,
        resourceType: TIME_ENTRY_RESOURCE,
        resourceAttributes: buildResourceAttributes(entryId, payload),
    });

    return resolved.service.approveTimeEntry({ authorization, entryId, payload });
}

function buildResourceAttributes(
    entryId: string,
    payload: ApproveTimeEntryPayload,
): Record<string, unknown> {
    return {
        entryId,
        decision: payload.status ?? 'APPROVED',
    };
}
