import { randomUUID } from 'node:crypto';
import type { ComplianceLogItem } from '@/server/types/compliance-types';

export function createComplianceItem(overrides: Partial<ComplianceLogItem> = {}): ComplianceLogItem {
    return {
        id: overrides.id ?? randomUUID(),
        orgId: overrides.orgId ?? randomUUID(),
        userId: overrides.userId ?? 'user-' + Math.random().toString(16).slice(2),
        templateItemId: overrides.templateItemId ?? 'template-' + Math.random().toString(16).slice(2),
        categoryKey: overrides.categoryKey ?? 'pre_employment',
        status: overrides.status ?? 'PENDING',
        dueDate: overrides.dueDate ?? new Date(),
        completedAt: overrides.completedAt ?? null,
        reviewedBy: overrides.reviewedBy ?? null,
        reviewedAt: overrides.reviewedAt ?? null,
        notes: overrides.notes ?? null,
        attachments: overrides.attachments ?? null,
        metadata: overrides.metadata ?? {},
        createdAt: overrides.createdAt ?? new Date(),
        updatedAt: overrides.updatedAt ?? new Date(),
    } satisfies ComplianceLogItem;
}
