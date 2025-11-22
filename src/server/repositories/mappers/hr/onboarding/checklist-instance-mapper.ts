import type {
    ChecklistInstanceCreateInput,
    ChecklistInstanceItemsUpdate,
} from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type {
    ChecklistInstance,
    ChecklistInstanceStatus,
    ChecklistItemProgress,
} from '@/server/types/onboarding-types';

export type ChecklistInstanceRecord = {
    id: string;
    orgId: string;
    employeeId: string;
    templateId: string;
    templateName?: string;
    status: ChecklistInstanceStatus;
    items: ChecklistItemProgress[];
    startedAt: Date | string;
    completedAt?: Date | string | null;
    metadata?: Record<string, unknown>;
};

export function mapChecklistInstanceRecordToDomain(record: ChecklistInstanceRecord): ChecklistInstance {
    return {
        id: record.id,
        orgId: record.orgId,
        employeeId: record.employeeId,
        templateId: record.templateId,
        templateName: record.templateName,
        status: record.status,
        items: record.items ?? [],
        startedAt: record.startedAt instanceof Date ? record.startedAt : new Date(record.startedAt),
        completedAt:
            record.completedAt === undefined || record.completedAt === null
                ? null
                : record.completedAt instanceof Date
                    ? record.completedAt
                    : new Date(record.completedAt),
        metadata: record.metadata,
    };
}

export function mapChecklistInstanceInputToRecord(
    input: ChecklistInstanceCreateInput | ChecklistInstanceItemsUpdate,
): Partial<ChecklistInstanceRecord> {
    const payload: Partial<ChecklistInstanceRecord> = {};
    if ('orgId' in input) payload.orgId = input.orgId;
    if ('employeeId' in input) payload.employeeId = input.employeeId;
    if ('templateId' in input) payload.templateId = input.templateId;
    if ('templateName' in input) payload.templateName = input.templateName;
    if (input.items !== undefined) payload.items = input.items;
    if ('metadata' in input && input.metadata !== undefined) payload.metadata = input.metadata;
    return payload;
}
