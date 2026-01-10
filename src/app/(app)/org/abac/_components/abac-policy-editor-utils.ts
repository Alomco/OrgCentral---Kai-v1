import type { ConditionDraft, ConditionScope, PolicyDraft } from './abac-policy-types';

export function getPolicyField(
    localId: string,
    field: 'actions' | 'resources',
    drafts: PolicyDraft[],
): string[] {
    const draft = drafts.find((item) => item.localId === localId);
    if (!draft) {
        return [];
    }
    return field === 'actions' ? draft.actions : draft.resources;
}

export function getPolicyConditions(
    localId: string,
    scope: ConditionScope,
    drafts: PolicyDraft[],
): ConditionDraft[] {
    const draft = drafts.find((item) => item.localId === localId);
    if (!draft) {
        return [];
    }
    return scope === 'subject' ? draft.subjectConditions : draft.resourceConditions;
}

export function dedupe(values: string[]): string[] {
    const trimmed = values.map((value) => value.trim()).filter((value) => value.length > 0);
    return Array.from(new Set(trimmed));
}
