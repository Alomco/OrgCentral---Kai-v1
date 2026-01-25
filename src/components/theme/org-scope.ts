'use client';

export const ORG_SCOPE_CHANGE_EVENT = 'orgcentral-org-scope-change';

export function readOrgScope(): string {
    try {
        return document.documentElement.dataset.orgId ?? 'default';
    } catch {
        return 'default';
    }
}
