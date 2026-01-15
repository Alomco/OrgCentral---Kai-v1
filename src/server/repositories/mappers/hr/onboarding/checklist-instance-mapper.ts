import type {
    ChecklistInstanceCreateInput,
    ChecklistInstanceItemsUpdate,
} from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type {
    ChecklistInstance,
    ChecklistInstanceStatus,
    ChecklistItemProgress,
} from '@/server/types/onboarding-types';
import type { PrismaJsonValue } from '@/server/types/prisma';

type JsonRecord = Record<string, PrismaJsonValue>;

export interface ChecklistInstanceRecord {
    id: string;
    orgId: string;
    employeeId: string;
    templateId: string;
    templateName?: string | null;
    status: ChecklistInstanceStatus;
    items: PrismaJsonValue | null | undefined;
    startedAt: Date | string;
    completedAt?: Date | string | null;
    metadata?: PrismaJsonValue | null;
}


function serializeChecklistItem(item: ChecklistItemProgress): JsonRecord {
    const completedAt =
        item.completedAt instanceof Date ? item.completedAt.toISOString() : null;
    return {
        ...item,
        completedAt,
    };
}

function deserializeChecklistItem(item: PrismaJsonValue): ChecklistItemProgress {
    if (!isJsonRecord(item)) {
        throw new Error('Invalid checklist item payload');
    }
    const task = item.task;
    const completed = item.completed;
    if (typeof task !== 'string' || typeof completed !== 'boolean') {
        throw new Error('Invalid checklist item payload');
    }
    const completedAt =
        typeof item.completedAt === 'string'
            ? new Date(item.completedAt)
            : item.completedAt === null
                ? null
                : undefined;
    const notes =
        typeof item.notes === 'string' ? item.notes : item.notes === null ? null : undefined;
    return {
        task,
        completed,
        completedAt,
        notes,
    };
}

export function mapChecklistInstanceRecordToDomain(record: ChecklistInstanceRecord): ChecklistInstance {
    const rawItems = Array.isArray(record.items) ? record.items : [];

    const items = rawItems.map((item) => deserializeChecklistItem(item));

    const metadata = isJsonRecord(record.metadata) ? record.metadata : undefined;
    return {
        id: record.id,
        orgId: record.orgId,
        employeeId: record.employeeId,
        templateId: record.templateId,
        templateName: record.templateName ?? undefined,
        status: record.status,
        items,
        startedAt: record.startedAt instanceof Date ? record.startedAt : new Date(record.startedAt),
        completedAt:
            record.completedAt === undefined || record.completedAt === null
                ? null
                : record.completedAt instanceof Date
                    ? record.completedAt
                    : new Date(record.completedAt),
        metadata,
    };
}

function isJsonRecord(value: PrismaJsonValue | null | undefined): value is JsonRecord {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function mapChecklistInstanceInputToRecord(
    input: ChecklistInstanceCreateInput | ChecklistInstanceItemsUpdate,
): Partial<ChecklistInstanceRecord> {
    const payload: Partial<ChecklistInstanceRecord> = {};
    if ('orgId' in input) { payload.orgId = input.orgId; }
    if ('employeeId' in input) { payload.employeeId = input.employeeId; }
    if ('templateId' in input) { payload.templateId = input.templateId; }
    if ('templateName' in input) { payload.templateName = input.templateName; }

    if (input.items) {
        payload.items = input.items.map(serializeChecklistItem);
    }

    if (input.metadata !== undefined) { payload.metadata = input.metadata as PrismaJsonValue; }
    return payload;
}

