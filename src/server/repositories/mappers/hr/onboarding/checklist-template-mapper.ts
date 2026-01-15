import type {
    ChecklistTemplateCreateInput,
    ChecklistTemplateUpdateInput,
} from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { ChecklistTemplate, ChecklistTemplateItem, ChecklistTemplateType } from '@/server/types/onboarding-types';
import type { PrismaJsonValue } from '@/server/types/prisma';

type JsonRecord = Record<string, PrismaJsonValue>;

export interface ChecklistTemplateRecord {
    id: string;
    orgId: string;
    name: string;
    type: ChecklistTemplateType;
    items: PrismaJsonValue | null | undefined;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export function mapChecklistTemplateRecordToDomain(record: ChecklistTemplateRecord): ChecklistTemplate {
    const items = Array.isArray(record.items)
        ? record.items.reduce<ChecklistTemplateItem[]>((accumulator, item) => {
            const parsed = parseChecklistTemplateItem(item);
            if (parsed) {
                accumulator.push(parsed);
            }
            return accumulator;
        }, [])
        : [];
    return {
        id: record.id,
        orgId: record.orgId,
        name: record.name,
        type: record.type,
        items,
        createdAt: record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt),
        updatedAt: record.updatedAt instanceof Date ? record.updatedAt : new Date(record.updatedAt),
    };
}

export function mapChecklistTemplateInputToRecord(
    input: ChecklistTemplateCreateInput | ChecklistTemplateUpdateInput,
): Partial<ChecklistTemplateRecord> {
    const payload: Partial<ChecklistTemplateRecord> = {};
    if ('orgId' in input) { payload.orgId = input.orgId; }
    if (input.name !== undefined) { payload.name = input.name; }
    if (input.type !== undefined) { payload.type = input.type; }
    if (input.items !== undefined) {
        payload.items = input.items.map((item) => ({ ...item })) as PrismaJsonValue;
    }
    return payload;
}

function parseChecklistTemplateItem(value: PrismaJsonValue): ChecklistTemplateItem | null {
    if (!isJsonRecord(value)) {
        return null;
    }
    if (typeof value.label !== 'string') {
        return null;
    }
    const item: ChecklistTemplateItem = { label: value.label };
    if (typeof value.id === 'string') {
        item.id = value.id;
    }
    if (typeof value.description === 'string') {
        item.description = value.description;
    }
    if (typeof value.order === 'number') {
        item.order = value.order;
    }
    if (isJsonRecord(value.metadata)) {
        item.metadata = value.metadata as ChecklistTemplateItem['metadata'];
    }
    return item;
}

function isJsonRecord(value: PrismaJsonValue | null | undefined): value is JsonRecord {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
