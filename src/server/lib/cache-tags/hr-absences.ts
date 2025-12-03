export const HR_ABSENCE_CACHE_SCOPES = {
    absences: 'hr-absences',
    leaveBalances: 'leave-balances',
    aiValidation: 'hr:absences:ai-validation',
} as const;

export type HrAbsenceCacheScopeKey = keyof typeof HR_ABSENCE_CACHE_SCOPES;

export function resolveAbsenceCacheScopes(options?: {
    includeLeaveBalances?: boolean;
    includeAiValidation?: boolean;
}): string[] {
    const scopes = new Set<string>();
    scopes.add(HR_ABSENCE_CACHE_SCOPES.absences);

    if (options?.includeLeaveBalances) {
        scopes.add(HR_ABSENCE_CACHE_SCOPES.leaveBalances);
    }

    if (options?.includeAiValidation) {
        scopes.add(HR_ABSENCE_CACHE_SCOPES.aiValidation);
    }

    return Array.from(scopes);
}
